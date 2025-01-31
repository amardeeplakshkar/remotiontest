import { Player } from '@remotion/player';
import { TextVideo } from './TextVideo';

interface VideoPreviewProps {
  text: string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ text }) => {
  return (
    <div className="w-full aspect-video">
      <Player
        component={TextVideo}
        inputProps={{ text }}
        durationInFrames={90}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        style={{
          width: '100%',
          height: '100%',
        }}
        controls
      />
    </div>
  );
};