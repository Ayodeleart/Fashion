export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 2C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H7ZM15.75 13.299C16.75 12.7217 16.75 11.2783 15.75 10.7009L11.25 8.10286C10.25 7.52551 9 8.24719 9 9.4019V14.598C9 15.7527 10.25 16.4744 11.25 15.8971L15.75 13.299Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function LikeIcon({ filled, className }: { filled: boolean; className?: string }) {
  if (filled) {
    return (
      <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M171.28,41.69a48.29,48.29,0,0,0-68.5,0l-2.5,3-2.5-2.5a48.29,48.29,0,0,0-68.5,0c-19,18.5-19,49-1,68l50,53a29.92,29.92,0,0,0,43.5,0l50.5-53.5c17.5-19.5,17-49.5-1-68Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  // Separate outline-only path (not the filled shape stroked) — stroking
  // the solid path drew both its inner and outer contour, showing as a
  // doubled line. This is a plain single-contour heart instead.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 20.5s-7.6-4.35-10.1-9.2C.4 8 2.2 4.4 5.9 3.9c2.2-.3 4.2 1 6.1 3.1 1.9-2.1 3.9-3.4 6.1-3.1 3.7.5 5.5 4.1 4 7.4-2.5 4.85-10.1 9.2-10.1 9.2Z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CommentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.98608 11.1034C1.98608 13.3236 2.78607 15.376 4.13153 16.9992C5.93153 19.238 8.78608 20.6746 11.9861 20.6746C11.9861 20.6746 15.5028 21.9659 17.8427 22.4553C18.6528 22.6248 19.5517 22.0692 19.5517 21.3173C19.5517 20.4026 17.9861 18.753 17.9861 18.753C19.1009 17.959 20.033 16.9462 20.7162 15.7808C21.526 14.3994 21.9861 12.8036 21.9861 11.1034C21.9861 9.39876 21.5255 7.7997 20.7162 6.41587C19.9666 5.13402 18.9178 4.03683 17.6588 3.21143C16.0406 2.12931 14.0952 1.51367 11.9861 1.51367C6.45881 1.51367 1.98608 5.80475 1.98608 11.1034Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.3009 13.6949L20.102 3.89742M10.5795 14.1355L12.8019 18.5804C13.339 19.6545 13.6075 20.1916 13.9458 20.3356C14.2394 20.4606 14.575 20.4379 14.8492 20.2747C15.1651 20.0866 15.3591 19.5183 15.7472 18.3818L19.9463 6.08434C20.2845 5.09409 20.4535 4.59896 20.3378 4.27142C20.2371 3.98648 20.013 3.76234 19.7281 3.66167C19.4005 3.54595 18.9054 3.71502 17.9151 4.05315L5.61763 8.2523C4.48114 8.64037 3.91289 8.83441 3.72478 9.15032C3.56153 9.42447 3.53891 9.76007 3.66389 10.0536C3.80791 10.3919 4.34498 10.6605 5.41912 11.1975L9.86397 13.42C10.041 13.5085 10.1295 13.5527 10.2061 13.6118C10.2742 13.6643 10.3352 13.7253 10.3876 13.7933C10.4468 13.87 10.491 13.9585 10.5795 14.1355Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Not from a provided SVG — matching the same 24x24 stroke-icon style as
// Comment/Send above so the rail reads as one consistent icon set.
export function SpeakerMutedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 9.5h3.5L13 5v14l-5.5-4.5H4z" fill="currentColor" />
      <path d="M17 9l4.5 6M21.5 9L17 15" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function SpeakerOnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 9.5h3.5L13 5v14l-5.5-4.5H4z" fill="currentColor" />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7M18.8 6a8.5 8.5 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}
