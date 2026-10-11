import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { emptyProgress, parseProgress, PROGRESS_KEY } from "../data/progress";
const ProgressContext = createContext(null);
export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(emptyProgress);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  useEffect(() => {
    try {
      setProgress(parseProgress(localStorage.getItem(PROGRESS_KEY)));
    } catch {
      setPersistent(false);
    }
    setReady(true);
    const sync = (event) => {
      if (event.key === PROGRESS_KEY)
        setProgress(parseProgress(event.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      setPersistent(false);
    }
  }, [progress, ready]);
  const visit = useCallback(
    (route) =>
      setProgress((p) =>
        p.lastVisited === route ? p : { ...p, lastVisited: route },
      ),
    [],
  );
  const toggle = useCallback(
    (route) =>
      setProgress((p) => ({
        ...p,
        completed: p.completed.includes(route)
          ? p.completed.filter((item) => item !== route)
          : [...p.completed, route],
      })),
    [],
  );
  const reset = useCallback(() => setProgress(emptyProgress()), []);
  return (
    <ProgressContext.Provider
      value={{ progress, ready, persistent, visit, toggle, reset }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
export const useProgress = () => useContext(ProgressContext);
