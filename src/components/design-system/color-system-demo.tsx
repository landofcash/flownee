"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Home,
  ListTodo,
  Mic,
  Sparkles,
} from "lucide-react";

import { CompletionConfetti } from "@/components/magicui/completion-confetti";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const navigationItems = [
  { id: "today", label: "Today", icon: Home },
  { id: "flow", label: "Flow", icon: ListTodo },
  { id: "later", label: "Later", icon: CalendarDays },
];

const swatches = [
  { name: "Primary", value: "#525AFF", className: "bg-[#525aff]" },
  { name: "Flow", value: "#4AB5B5", className: "bg-[#4ab5b5]" },
  { name: "Support", value: "#6D8BC0", className: "bg-[#6d8bc0]" },
  { name: "Highlight", value: "#8FD9FB", className: "bg-[#8fd9fb]" },
];

function DemoSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-8 first:border-t-0 first:pt-0">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function ColorSystemDemo() {
  const [activeNavigation, setActiveNavigation] = useState("today");
  const [completionPreviewTrigger, setCompletionPreviewTrigger] = useState(0);

  return (
    <main className="min-h-svh bg-background text-foreground">
        <CompletionConfetti trigger={completionPreviewTrigger} />
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-10">
            <div>
              <Image
                src="/flownee-mark-v2.png"
                alt="Flownee"
                width={116}
                height={32}
                priority
                className="mb-4 h-auto w-29"
              />
              <Badge variant="suggested">Internal reference</Badge>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Flownee color system
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                Calm neutrals carry the interface. Violet guides action, teal marks
                flow and completion, muted blue supports, and light blue highlights.
              </p>
            </div>
          </div>

          <div className="space-y-10">
            <DemoSection title="Brand palette" description="Functional roles, not equal visual weight.">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {swatches.map((swatch) => (
                  <div key={swatch.name} className="overflow-hidden rounded-xl border bg-card">
                    <div className={`h-20 ${swatch.className}`} />
                    <div className="p-3">
                      <p className="text-sm font-semibold">{swatch.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{swatch.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DemoSection>

            <DemoSection title="Buttons" description="Violet leads; teal supports; semantic red stays reserved for destructive actions.">
              <div className="flex flex-wrap gap-3">
                <Button>Primary action</Button>
                <Button variant="secondary">Secondary action</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Delete</Button>
                <Button disabled>Disabled</Button>
              </div>
            </DemoSection>

            <DemoSection
              title="Completion feedback"
              description="One restrained, non-blocking burst after a completion is safely stored."
            >
              <Button
                onClick={() =>
                  setCompletionPreviewTrigger((current) => current + 1)
                }
              >
                <Check aria-hidden="true" />
                Preview completion celebration
              </Button>
            </DemoSection>

            <DemoSection title="Task cards" description="Status appears as a restrained edge, tint, or badge.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card tone="next">
                  <CardHeader>
                    <Badge variant="important">Do this now</Badge>
                    <CardTitle>Buy coffee beans and groceries</CardTitle>
                    <CardDescription>One compatible shopping session</CardDescription>
                  </CardHeader>
                </Card>
                <Card tone="completed">
                  <CardHeader>
                    <Badge variant="completed"><Check aria-hidden="true" /> Completed</Badge>
                    <CardTitle>Replace the watch battery</CardTitle>
                    <CardDescription>Finished without extra ceremony</CardDescription>
                  </CardHeader>
                </Card>
                <Card tone="scheduled">
                  <CardHeader>
                    <Badge variant="scheduled"><Clock3 aria-hidden="true" /> Scheduled</Badge>
                    <CardTitle>Replant the pine tree</CardTitle>
                    <CardDescription>Supporting information uses muted blue</CardDescription>
                  </CardHeader>
                </Card>
                <Card tone="suggested">
                  <CardHeader>
                    <Badge variant="suggested"><Sparkles aria-hidden="true" /> Suggested</Badge>
                    <CardTitle>Prepare the gardening tools</CardTitle>
                    <CardDescription>A soft highlight, never light-blue body text</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </DemoSection>

            <DemoSection title="Voice states" description="The gradient is reserved for active recording and AI flow.">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="items-center text-center">
                  <CardContent className="flex flex-col items-center">
                    <span className="flex size-16 items-center justify-center rounded-full border border-flow/70 bg-action text-action-foreground shadow-[0_0_28px_var(--voice-glow)]">
                      <Mic aria-hidden="true" className="size-7" />
                    </span>
                    <p className="mt-3 font-semibold">Ready</p>
                  </CardContent>
                </Card>
                <Card className="items-center text-center">
                  <CardContent className="flex flex-col items-center">
                    <span className="animate-flownee-gradient animate-flownee-glow flex size-16 items-center justify-center rounded-full bg-flownee-gradient p-1 motion-reduce:animate-none">
                      <span className="flex size-full items-center justify-center rounded-full bg-action text-action-foreground">
                        <Mic aria-hidden="true" className="size-7" />
                      </span>
                    </span>
                    <p className="mt-3 font-semibold">Recording</p>
                  </CardContent>
                </Card>
                <Card className="items-center text-center">
                  <CardContent className="flex flex-col items-center">
                    <span className="animate-flownee-gradient flex size-16 items-center justify-center rounded-2xl bg-flownee-gradient p-0.5 motion-reduce:animate-none">
                      <span className="flex size-full items-center justify-center rounded-[0.65rem] bg-surface text-primary">
                        <Sparkles aria-hidden="true" className="size-7" />
                      </span>
                    </span>
                    <p className="mt-3 font-semibold">Processing</p>
                  </CardContent>
                </Card>
              </div>
            </DemoSection>

            <DemoSection title="Inputs" description="Neutral surfaces, violet focus, and explicit semantic errors.">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Task title
                  <Input className="mt-2" defaultValue="Buy coffee beans" />
                </label>
                <label className="text-sm font-semibold">
                  Example error
                  <Input className="mt-2" aria-invalid="true" defaultValue="" />
                  <span className="mt-2 flex items-center gap-1.5 text-xs text-error-foreground">
                    <CircleAlert aria-hidden="true" className="size-3.5" /> A title is required.
                  </span>
                </label>
                <label className="text-sm font-semibold sm:col-span-2">
                  Notes
                  <Textarea className="mt-2" rows={3} defaultValue="Pick these up during the grocery trip." />
                </label>
              </div>
            </DemoSection>

            <DemoSection title="Badges" description="Tinted surfaces retain dark, readable foregrounds.">
              <div className="flex flex-wrap gap-2">
                <Badge variant="important">Important</Badge>
                <Badge variant="completed">Completed</Badge>
                <Badge variant="scheduled">Scheduled</Badge>
                <Badge variant="suggested">Suggested</Badge>
                <Badge variant="warning">Needs attention</Badge>
                <Badge variant="error">Error</Badge>
              </div>
            </DemoSection>

            <DemoSection title="Navigation preview" description="A reusable visual pattern only; it is not added to the live app shell.">
              <div className="mx-auto max-w-md overflow-hidden rounded-xl border">
                <BottomNavigation
                  items={navigationItems}
                  activeId={activeNavigation}
                  onChange={setActiveNavigation}
                />
              </div>
            </DemoSection>

            <DemoSection title="Empty state" description="Light blue supports the moment without becoming low-contrast text.">
              <Card tone="suggested" className="items-center py-12 text-center">
                <CardContent className="flex max-w-md flex-col items-center">
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-highlight/30 text-foreground">
                    <CheckCircle2 aria-hidden="true" className="size-8" />
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold">Your flow is clear</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    Add another intention whenever something comes to mind.
                  </p>
                </CardContent>
              </Card>
            </DemoSection>

            <DemoSection title="Onboarding example" description="One of the few appropriate places for the complete brand gradient.">
              <div className="animate-flownee-gradient overflow-hidden rounded-2xl bg-flownee-gradient p-5 motion-reduce:animate-none sm:p-8">
                <div className="max-w-2xl rounded-xl bg-white/90 p-6 text-[#17213f] shadow-sm backdrop-blur-sm sm:p-8">
                  <Badge className="bg-[#eeeefe] text-[#373dc2]">Welcome to Flownee</Badge>
                  <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                    Move naturally from intention to action.
                  </h3>
                  <p className="mt-3 leading-7 text-[#17213f]">
                    Speak what is on your mind and receive one calm, practical next step.
                  </p>
                </div>
              </div>
            </DemoSection>
          </div>
        </div>
    </main>
  );
}
