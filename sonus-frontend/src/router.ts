let _navigate: ((to: string) => void) | null = null;

export function setNavigate(fn: (to: string) => void) {
  _navigate = fn;
}

export function navigate(to: string) {
  if (_navigate) {
    _navigate(to);
  } else {

    window.location.href = to;
  }
}
