import React from 'react';
import classNames from 'classnames';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'default' | 'teamA' | 'teamB' | 'error' | 'success';
}

export const Panel: React.FC<PanelProps> = ({
  children,
  glow = 'default',
  className,
  ...props
}) => {
  const baseStyles = "bg-[var(--color-panel-bg)] border rounded-[var(--radius)] p-5 backdrop-blur-sm transition-all duration-300";

  const glows = {
    default: "border-[var(--color-panel-border)] shadow-[var(--shadow-neon)]",
    teamA: "border-[var(--color-team-a)] shadow-[0_0_15px_rgba(46,230,214,0.2)]",
    teamB: "border-[var(--color-team-b)] shadow-[0_0_15px_rgba(255,138,61,0.2)]",
    error: "border-[var(--color-error)] shadow-[0_0_15px_rgba(248,113,113,0.2)]",
    success: "border-[var(--color-success)] shadow-[0_0_15px_rgba(52,211,153,0.2)]"
  };

  return (
    <div className={classNames(baseStyles, glows[glow], className)} {...props}>
      {children}
    </div>
  );
};
