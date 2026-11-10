import type { ReactNode, RefObject } from "react";

type StageProps = {
  stageRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

export function Stage({ stageRef, children }: StageProps) {
  return (
    <div className="stage-fit">
      <div ref={stageRef} className="stage">
        {children}
      </div>
    </div>
  );
}
