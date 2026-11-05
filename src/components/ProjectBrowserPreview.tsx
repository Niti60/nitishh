import { useEffect, useRef, useState } from "react";

import { usePreviewAutoScroll } from "../hooks/usePreviewAutoScroll";
import type { Project } from "../lib/projects";

type ProjectBrowserPreviewProps = {
  project: Pick<Project, "name" | "cover" | "browserDomain">;
  onOpen?: () => void;
  isModal?: boolean;
  className?: string;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
};

function useHoverEnabled() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return canHover;
}

export function ProjectBrowserPreview({
  project,
  onOpen,
  isModal = false,
  className = "",
  triggerRef,
}: ProjectBrowserPreviewProps) {
  const [error, setError] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasHover = useHoverEnabled();
  const hasImage = Boolean(project.cover) && !error;

  const viewportClassName = isModal ? "project-modal__viewport" : "project-preview__viewport";
  const browserClassName = isModal
    ? "project-preview__window project-modal__browser"
    : "project-preview__window";
  const headerClassName = isModal
    ? "project-preview__header project-modal__browser-header"
    : "project-preview__header";
  const urlClassName = isModal ? "project-preview__url project-modal__url" : "project-preview__url";

  const {
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onTouchMove,
    onWheel,
    resetPreview,
    stopAutoScroll,
  } = usePreviewAutoScroll(viewportRef, {
    enabled: hasHover && !reducedMotion,
    hoverDelay: 1000,
    duration: 12000,
    resetOnLeave: true,
    onAutoScrollStart: () => setIsAutoScrolling(true),
    onAutoScrollStop: () => setIsAutoScrolling(false),
  });

  useEffect(() => {
    resetPreview();
  }, [project.cover, resetPreview]);

  const handleOpen = () => {
    stopAutoScroll();
    resetPreview();
    onOpen?.();
  };

  const preview = (
    <>
      <span className={headerClassName} aria-hidden="true">
        <span className="project-preview__dots">
          <span />
          <span />
          <span />
        </span>
        {isModal ? (
          <span className="project-modal__address-wrap">
            <span className="project-modal__lock" aria-hidden="true">
              🔒
            </span>
            <span className={urlClassName}>{project.browserDomain}</span>
          </span>
        ) : (
          <span className={urlClassName}>{project.browserDomain}</span>
        )}
      </span>

      <div
        ref={viewportRef}
        className={viewportClassName}
        aria-hidden={!hasImage}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onTouchMove={onTouchMove}
        onWheel={onWheel}
      >
        {hasImage ? (
          <img
            src={project.cover}
            alt={`${project.name} long-form project screenshot`}
            className="project-preview__image"
            loading="lazy"
            onError={() => setError(true)}
          />
        ) : (
          <span
            className="project-preview__fallback"
            aria-label={`${project.name} preview unavailable`}
          >
            <span className="project-preview__fallback-name">{project.name}</span>
            <span className="project-preview__fallback-note">Screenshot coming</span>
          </span>
        )}
      </div>

      {!isModal && !isAutoScrolling ? (
        <span className="project-preview__hint">Scroll to explore</span>
      ) : null}
    </>
  );

  if (isModal) {
    return <div className={`${browserClassName} ${className}`.trim()}>{preview}</div>;
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      className={`project-preview project-preview--trigger ${className}`.trim()}
      aria-label={`Open ${project.name} project preview`}
      onClick={handleOpen}
    >
      <span className={browserClassName}>{preview}</span>
    </button>
  );
}
