import { useEffect, useRef } from "react";

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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

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
    }, 30);

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
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
          <div>
            <p id="project-preview-modal-title" className="project-modal__title">
              {projectName}
            </p>
            <span className="project-modal__category">{projectCategory}</span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="project-modal__close"
            aria-label={`Close ${projectName} preview`}
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="project-modal__browser">
          <div className="project-preview__header project-modal__browser-header" aria-hidden="true">
            <div className="project-preview__dots">
              <span />
              <span />
              <span />
            </div>
            <div className="project-modal__address-wrap">
              <span className="project-modal__lock" aria-hidden="true">
                🔒
              </span>
              <span className="project-preview__url project-modal__url">{projectUrl}</span>
            </div>
          </div>

          <div className="project-modal__viewport" tabIndex={0} aria-label={`${projectName} expanded project preview`}>
            <img
              src={imageSrc}
              alt={`${projectName} long-form project screenshot`}
              className="project-preview__image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
