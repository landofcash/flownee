"use client";

import type { ReactNode } from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import type {
  CreateTypes as ConfettiInstance,
  GlobalOptions as ConfettiGlobalOptions,
  Options as ConfettiOptions,
} from "canvas-confetti";
import confetti from "canvas-confetti";

// Copyright (c) Magic UI. Adapted under the MIT License.
// Source: https://magicui.design/docs/components/confetti
type ConfettiApi = {
  fire: (options?: ConfettiOptions) => void;
};

export type ConfettiProps = React.ComponentPropsWithRef<"canvas"> & {
  options?: ConfettiOptions;
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
  children?: ReactNode;
};

export type ConfettiRef = ConfettiApi | null;

const ConfettiContext = createContext<ConfettiApi>({} as ConfettiApi);
const DEFAULT_GLOBAL_OPTIONS = {
  resize: true,
  useWorker: true,
} satisfies ConfettiGlobalOptions;

const ConfettiComponent = forwardRef<ConfettiRef, ConfettiProps>(
  (props, ref) => {
    const {
      options,
      globalOptions = DEFAULT_GLOBAL_OPTIONS,
      manualstart = false,
      children,
      ...rest
    } = props;
    const instanceRef = useRef<ConfettiInstance | null>(null);

    const canvasRef = useCallback(
      (node: HTMLCanvasElement | null) => {
        if (node !== null) {
          if (instanceRef.current) return;
          instanceRef.current = confetti.create(node, {
            ...globalOptions,
            resize: true,
          });
          return;
        }

        instanceRef.current?.reset();
        instanceRef.current = null;
      },
      [globalOptions],
    );

    const fire = useCallback(
      async (overrideOptions: ConfettiOptions = {}) => {
        try {
          await instanceRef.current?.({ ...options, ...overrideOptions });
        } catch {
          // Celebration is optional feedback and must never disrupt task actions.
        }
      },
      [options],
    );

    const api = useMemo(() => ({ fire }), [fire]);
    useImperativeHandle(ref, () => api, [api]);

    useEffect(() => {
      if (!manualstart) void fire();
    }, [fire, manualstart]);

    return (
      <ConfettiContext.Provider value={api}>
        <canvas ref={canvasRef} {...rest} />
        {children}
      </ConfettiContext.Provider>
    );
  },
);

ConfettiComponent.displayName = "Confetti";

export const Confetti = ConfettiComponent;
