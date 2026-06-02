import { type SVGProps } from "react";

type LogoVariant = "color" | "on-dark";

interface LogoProps extends Omit<SVGProps<SVGSVGElement>, "viewBox"> {
  variant?: LogoVariant;
  /** rendered height in px; width scales to the 280:60 ratio */
  height?: number;
  title?: string;
}

export function Logo({
  variant = "color",
  height = 32,
  title = "FusionPrints",
  ...props
}: LogoProps) {
  const bodyFill = variant === "on-dark" ? "#FBF7F0" : "#1F1B16";
  const textFill = bodyFill;
  const width = (height * 280) / 60;

  return (
    <svg
      viewBox="0 0 280 60"
      width={width}
      height={height}
      role="img"
      aria-label={title}
      {...props}
    >
      <title>{title}</title>
      <g transform="translate(0,6)">
        <path
          d="M0 8 L12 0 L40 0 L40 14 L26 14 L14 22 L14 48 L0 48 Z"
          fill={bodyFill}
        />
        <path d="M14 22 L26 14 L40 14 L40 28 Z" fill="#05D668" />
      </g>
      <text
        x="56"
        y="40"
        fontSize="28"
        fontWeight={700}
        letterSpacing="-0.56"
        fill={textFill}
        style={{ fontFamily: "var(--ff-outfit), system-ui, sans-serif" }}
      >
        fusionprints
      </text>
    </svg>
  );
}
