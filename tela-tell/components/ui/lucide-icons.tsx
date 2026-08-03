import type { FC } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
};

const defaults = {
  size: 24,
  color: '#000',
  strokeWidth: 2,
  fill: 'transparent',
};

function iconProps(props: IconProps) {
  return {
    width: props.size ?? defaults.size,
    height: props.size ?? defaults.size,
    viewBox: '0 0 24 24',
    fill: 'none',
  };
}

export const Home: FC<IconProps> = (props) => {
  const { color, strokeWidth, fill } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
      <Path
        d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  );
};

export const ScanLine: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M3 7V5a2 2 0 0 1 2-2h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 3h2a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 17v2a2 2 0 0 1-2 2h-2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 21H5a2 2 0 0 1-2-2v-2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 12h10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const History: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 3v5h5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 7v5l4 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Eye: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const EyeOff: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.084 14.158a3 3 0 0 1-4.242-4.242"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="m2 2 20 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Mail: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Lock: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Square: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Settings: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Wifi: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M12 20h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 8.82a15 15 0 0 1 18 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 12.42a10 10 0 0 1 14.08 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8.5 16.429a5 5 0 0 1 7 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const ImagePlus: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M16 5h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19 2v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="9" r="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Camera: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Tag: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="7.5" cy="7.5" r=".5" fill={color} />
    </Svg>
  );
};

export const ChevronLeft: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="m15 18-6-6 6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const ChevronRight: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="m9 18 6-6-6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Share2: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 6l-4-4-4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2v13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const TriangleAlert: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 9v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 17h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Info: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 16v-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 8h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const X: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M18 6 6 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="m6 6 12 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const Leaf: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 18 2c1 2 2 4.5 2 8 0 5.5-4.78 10-9 10Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Recycle: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M7 19H4a1 1 0 0 1-1-1V14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m5 9-3 3 3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 5h3a1 1 0 0 1 1 1v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m19 15 3-3-3-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 8V4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m9 5 3-3 3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 16v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m15 19-3 3-3-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Heart: FC<IconProps> = (props) => {
  const { color, strokeWidth, fill } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  );
};

export const Bookmark: FC<IconProps> = (props) => {
  const { color, strokeWidth, fill } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  );
};

export const Trash2: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M3 6h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10 11v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 11v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Scissors: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Circle cx="6" cy="6" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M20 4 8.12 15.88" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M14.47 14.48 20 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M8.12 8.12 12 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const Smile: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 9h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M15 9h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const Baby: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M10 16c3.5 0 5-1.5 5-3.5V11h-1.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 16c-3.5 0-5-1.5-5-3.5V11h1.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 4a3 3 0 0 0-3 3v1h6V7a3 3 0 0 0-3-3Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 8H5a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 8h4a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9.5" cy="12.5" r="0.5" fill={color} stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="14.5" cy="12.5" r="0.5" fill={color} stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
};

export const Meh: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M8 15h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 9h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M15 9h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const Frown: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M16 16s-1.5-2-4-2-4 2-4 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 9h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M15 9h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const Layers: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 12a1 1 0 0 0-.58-.91l-8.6-3.91a2 2 0 0 0-1.65 0l-8.58 3.9A1 1 0 0 0 2 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 17a1 1 0 0 0-.58-.91l-8.6-3.91a2 2 0 0 0-1.65 0l-8.58 3.9A1 1 0 0 0 2 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Wind: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M12.8 19.5A2.5 2.5 0 1 0 10 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17.5 8a2.5 2.5 0 1 0 2.5-2.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.5 12a2.5 2.5 0 1 0 2.5-2.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12.8 6.5A2.5 2.5 0 1 0 14 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Shield: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const ShieldAlert: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 8v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 16h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Grid3x3: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M3 9h18" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M3 15h18" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M9 3v18" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M15 3v18" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
};

export const MoveHorizontal: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="m18 8 4 4-4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 12h20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m6 16-4-4 4-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const Droplets: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.57-3.09L7.35 5.09A.996.996 0 0 0 6 5.09L4.57 9.16c-1 .83-1.57 1.94-1.57 3.09 0 2.22 1.8 4.05 4 4.05z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const Shirt: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const User: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
};

export const Plus: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 5v14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const Check: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M20 6 9 17l-5-5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const CircleCheck: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="m9 12 2 2 4-4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const CircleX: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path d="m15 9-6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="m9 9 6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const Sparkles: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M9.94 2.94 8 8 2.94 9.94 8 11.88l1.94 5.06L11.88 16l5.06-1.94L18.88 11l-5.06-1.94L16 4l-5.06 1.94Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M20 3v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M22 5h-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const Calendar: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M8 2v4M16 2v4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
      <Path
        d="M3 10h18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const Search: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="m21 21-4.3-4.3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const Sun: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 2v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 20v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="m4.93 4.93 1.41 1.41" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="m17.66 17.66 1.41 1.41" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M2 12h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M20 12h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="m6.34 17.66-1.41 1.41" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="m19.07 4.93-1.41 1.41" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const Zap: FC<IconProps> = (props) => {
  const { color, strokeWidth, fill } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  );
};

export const ZapOff: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path
        d="M10.513 4.856 13.12 2.17a.5.5 0 0 1 .86.46l-1.377 4.312"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.656 10H20a1 1 0 0 1 .78 1.63l-1.712 1.773"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.273 16.273 10.88 21.83a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4a1 1 0 0 1-.78-1.63l4.507-4.643"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m2 2 20 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const LogOut: FC<IconProps> = (props) => {
  const { color, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg {...iconProps(props)}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m16 17 5-5-5-5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 12H9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};
