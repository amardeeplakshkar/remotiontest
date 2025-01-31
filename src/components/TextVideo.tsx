import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface TextVideoProps {
  text: string;
}

export const TextVideo: React.FC<TextVideoProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 20, fps * 3 - 20, fps * 3],
    [0, 1, 1, 0]
  );

  const scale = interpolate(
    frame,
    [0, 20, fps * 3 - 20, fps * 3],
    [0.7, 1, 1, 0.7]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: 'center',
          fontSize: '4em',
          fontWeight: 'bold',
          color: '#333',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};