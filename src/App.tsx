/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { VideoPreview } from './components/VideoPreview';
import { Github, Play, Download, AlertCircle } from 'lucide-react';

function App() {
  const [text, setText] = useState('Your Text Here');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerGithubAction = async (text: string) => {
    try {
      const response = await fetch(
        'https://api.github.com/repos/amardeeplakshkar/remotiontest/actions/workflows/render-video.yml/dispatches',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
          },
          body: JSON.stringify({
            ref: 'main',
            inputs: {
              text: text
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to trigger GitHub Action');
      }

      return true;
    } catch (err) {
      console.error('Error triggering GitHub Action:', err);
      throw err;
    }
  };

  const checkWorkflowStatus = async () => {
    try {
      const response = await fetch(
        'https://api.github.com/repos/amardeeplakshkar/remotiontest/actions/runs?per_page=1',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check workflow status');
      }

      const data = await response.json();
      return data.workflow_runs[0];
    } catch (err) {
      console.error('Error checking workflow status:', err);
      throw err;
    }
  };

  const downloadArtifact = async (runId: number) => {
    try {
      // Get artifacts list
      const artifactsResponse = await fetch(
        `https://api.github.com/repos/amardeeplakshkar/remotiontest/actions/runs/${runId}/artifacts`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
          }
        }
      );

      if (!artifactsResponse.ok) {
        throw new Error('Failed to get artifacts');
      }

      const artifacts = await artifactsResponse.json();
      const videoArtifact = artifacts.artifacts.find((a: any) => a.name === 'rendered-video');

      if (!videoArtifact) {
        throw new Error('Video artifact not found');
      }

      // Download the artifact
      const downloadResponse = await fetch(
        videoArtifact.archive_download_url,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
          }
        }
      );

      if (!downloadResponse.ok) {
        throw new Error('Failed to download video');
      }

      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading artifact:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    
    try {
      // Trigger the GitHub Action
      await triggerGithubAction(text);
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await checkWorkflowStatus();
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            
            if (status.conclusion === 'success') {
              await downloadArtifact(status.id);
            } else {
              setError('Video generation failed. Please try again.');
            }
          }
        } catch (err) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setError('Failed to check video status. Please try again.');
        }
      }, 5000); // Check every 5 seconds
      
    } catch (err) {
      setIsGenerating(false);
      setError('Failed to generate video. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Play className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-semibold">Text Video Generator</span>
            </div>
            <a
              href="https://github.com/amardeeplakshkar/remotiontest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <Github className="w-6 h-6" />
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                Enter your text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <VideoPreview text={text} />
              
              {error && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Video'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;