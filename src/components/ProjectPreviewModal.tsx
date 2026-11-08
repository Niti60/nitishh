import { ExternalLink, Lock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { usePreviewAutoScroll } from "../hooks/usePreviewAutoScroll";

type ProjectPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectCategory: string;
  projectUrl: string;
  imageSrc: string;
};

export function ProjectPreviewModal({
  isOpen,
  onClose,
  projectName,
  projectCategory,
  projectUrl,
  imageSrc,
}: ProjectPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onTouchMove,
    onWheel,
    resetPreview,
    stopAutoScroll,
  } = usePreviewAutoScroll(viewportRef, {
    enabled: !reducedMotion,
    hoverDelay: 1000,
    duration: 12000,
    resetOnLeave: true,
    onAutoScrollStart: () => setIsAutoScrolling(true),
    onAutoScrollStop: () => setIsAutoScrolling(false),
  });

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 40);

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      stopAutoScroll();
      resetPreview();
    };
  }, [isOpen, onClose, resetPreview, stopAutoScroll]);

  useEffect(() => {
    if (!isOpen) return;

    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!query.matches) {
      resetPreview();
      stopAutoScroll();
    }
  }, [isOpen, resetPreview, stopAutoScroll]);

  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = () => {
      if (!mediaQuery.matches) {
        resetPreview();
        stopAutoScroll();
      }
    };

    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, [isOpen, resetPreview, stopAutoScroll]);

  useEffect(() => {
    if (isOpen && viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !mounted) return null;

  const liveHref = projectUrl
    ? projectUrl.startsWith("http")
      ? projectUrl
      : `https://${projectUrl}`
    : "";

  return createPortal(
    <div
      className="project-modal__backdrop"
      role="presentation"
      aria-hidden={!isOpen}
      onClick={onClose}
    >
      <div
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-preview-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="project-modal__topbar">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="project-preview-modal-title" className="project-modal__title">
                {projectName}
              </h2>
              {projectCategory ? (
                <span className="project-modal__category">{projectCategory}</span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {liveHref ? (
              <a
                href={liveHref}
                target="_blank"
                rel="noreferrer"
                className="project-modal__visit-link"
                aria-label={`Visit live website for ${projectName}`}
              >
                <span>Live Site</span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}

            <button
              ref={closeButtonRef}
              type="button"
              className="project-modal__close"
              aria-label={`Close ${projectName} preview`}
              onClick={onClose}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="project-modal__browser">
          <div className="project-preview__header project-modal__browser-header" aria-hidden="true">
            <div className="project-preview__dots">
              <span />
              <span />
              <span />
            </div>
            <div className="project-modal__address-wrap">
              <Lock className="size-3 text-muted-foreground opacity-80" aria-hidden="true" />
              <span className="project-preview__url project-modal__url">{projectUrl}</span>
            </div>
          </div>

          <div
            ref={viewportRef}
            className="project-modal__viewport"
            tabIndex={0}
            aria-label={`${projectName} expanded project preview. Scroll to explore.`}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerDown={onPointerDown}
            onTouchMove={onTouchMove}
            onWheel={onWheel}
          >
            <img
              src={imageSrc}
              alt={`${projectName} application workflow and interface screenshot`}
              width={1280}
              height={800}
              className="project-preview__image"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        </div>

        {!isAutoScrolling ? <div className="sr-only">Scroll to explore</div> : null}
      </div>
    </div>,
    document.body,
  );
}
