"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Reply, Forward, Sparkles, Clock, User, ChevronRight, Mail } from 'lucide-react';

/* ================================================================== */
/*  LOCAL UI PRIMITIVES                                                */
/*  These replicate the shadcn/ui components the pasted source         */
/*  imports from @/components/ui/* which don't exist in this project.  */
/*  Kept minimal — just enough to compile with identical behavior.     */
/* ================================================================== */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-xl border border-[hsl(220,13%,91%)] bg-white text-[hsl(224,71%,4%)] shadow-sm ${className}`}
    {...props}
  />
));
Card.displayName = 'Card';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'icon';
  }
>(({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(220,13%,91%)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
  const variants: Record<string, string> = {
    default: 'bg-[hsl(222,47%,11%)] text-white hover:bg-[hsl(222,47%,11%)]/90',
    outline: 'border border-[hsl(220,13%,91%)] bg-white hover:bg-[hsl(210,40%,96%)] hover:text-[hsl(222,47%,11%)]',
    ghost: 'hover:bg-[hsl(210,40%,96%)] hover:text-[hsl(222,47%,11%)]',
  };
  const sizes: Record<string, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    icon: 'h-10 w-10',
  };
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      {...props}
    />
  );
});
Button.displayName = 'Button';

const Badge: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' }
> = ({ className = '', variant = 'default', ...props }) => {
  const variants: Record<string, string> = {
    default: 'border-transparent bg-[hsl(222,47%,11%)] text-white',
    secondary: 'border-transparent bg-[hsl(210,40%,96%)] text-[hsl(222,47%,11%)]',
    outline: 'border border-[hsl(220,13%,91%)] text-[hsl(215,20%,65%)]',
  };
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant] || variants.default} ${className}`}
      {...props}
    />
  );
};

const Separator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`shrink-0 bg-[hsl(220,13%,91%)] h-[1px] w-full ${className}`} {...props} />
);

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-[80px] w-full rounded-md border border-[hsl(220,13%,91%)] bg-white px-3 py-2 text-sm placeholder:text-[hsl(215,20%,65%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(220,13%,91%)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

/* ================================================================== */
/*  TYPES & DATA — verbatim from pasted source                         */
/* ================================================================== */

interface EmailThread {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  messageCount: number;
  labels: string[];
  fullContent: string;
  aiInsights: {
    summary: string;
    sentiment: 'positive' | 'neutral' | 'urgent';
    suggestedActions: string[];
    keyPoints: string[];
  };
}

const defaultThreads: EmailThread[] = [
  {
    id: '1',
    subject: 'Q4 Product Roadmap Review',
    sender: 'Sarah Chen',
    senderEmail: 'sarah.chen@example.com',
    preview: 'Hi team, I wanted to share the updated roadmap for Q4. We have some exciting features planned...',
    timestamp: '2 hours ago',
    unread: true,
    messageCount: 5,
    labels: ['Product', 'Important'],
    fullContent: 'Hi team,\n\nI wanted to share the updated roadmap for Q4. We have some exciting features planned that will significantly improve our user experience.\n\nKey highlights:\n- New dashboard redesign\n- Advanced analytics integration\n- Mobile app improvements\n\nLet me know your thoughts on the timeline and resource allocation.\n\nBest regards,\nSarah',
    aiInsights: {
      summary: 'Sarah is sharing Q4 product roadmap with key features including dashboard redesign, analytics, and mobile improvements. Requesting feedback on timeline and resources.',
      sentiment: 'positive',
      suggestedActions: ['Review roadmap document', 'Provide timeline feedback', 'Schedule follow-up meeting'],
      keyPoints: ['Dashboard redesign planned', 'Analytics integration', 'Mobile app focus', 'Resource allocation needed']
    }
  },
  {
    id: '2',
    subject: 'Urgent: Server Maintenance Window',
    sender: 'DevOps Team',
    senderEmail: 'devops@example.com',
    preview: 'Scheduled maintenance this Saturday from 2-4 AM EST. All services will be temporarily unavailable...',
    timestamp: '5 hours ago',
    unread: true,
    messageCount: 2,
    labels: ['DevOps', 'Urgent'],
    fullContent: 'Team,\n\nScheduled maintenance this Saturday from 2-4 AM EST. All services will be temporarily unavailable during this window.\n\nWhat to expect:\n- Database optimization\n- Security patches\n- Infrastructure upgrades\n\nPlease plan accordingly and notify your teams.\n\nThanks,\nDevOps',
    aiInsights: {
      summary: 'Critical maintenance window scheduled for Saturday 2-4 AM EST. All services will be down for database optimization and security updates.',
      sentiment: 'urgent',
      suggestedActions: ['Notify your team', 'Update status page', 'Confirm acknowledgment'],
      keyPoints: ['Saturday 2-4 AM EST downtime', 'Database optimization', 'Security patches', 'Team notification required']
    }
  },
  {
    id: '3',
    subject: 'Design System Updates - v2.0',
    sender: 'Alex Rivera',
    senderEmail: 'alex.rivera@example.com',
    preview: 'The new design system is ready for review. We have updated components, new color palette...',
    timestamp: '1 day ago',
    unread: false,
    messageCount: 8,
    labels: ['Design'],
    fullContent: 'Hey everyone,\n\nThe new design system v2.0 is ready for review. We have updated components, new color palette, and improved accessibility standards.\n\nPlease review the Figma file and provide feedback by end of week.\n\nLooking forward to your input!\n\nAlex',
    aiInsights: {
      summary: 'Design system v2.0 ready for review with updated components, colors, and accessibility improvements. Feedback needed by end of week.',
      sentiment: 'positive',
      suggestedActions: ['Review Figma file', 'Provide feedback', 'Test accessibility'],
      keyPoints: ['v2.0 ready', 'New color palette', 'Accessibility improvements', 'Feedback deadline: end of week']
    }
  }
];

/* ================================================================== */
/*  EmailThreadCard — verbatim from pasted source                      */
/*  Only change: imports resolved to local primitives above.           */
/* ================================================================== */

const EmailThreadCard: React.FC<{
  thread: EmailThread;
  isExpanded: boolean;
  onExpand: () => void;
  onClose: () => void;
}> = ({ thread, isExpanded, onExpand, onClose }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  const sentimentColors = {
    positive: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    neutral: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    urgent: 'bg-red-500/10 text-red-600 border-red-500/20'
  };

  if (isExpanded) {
    return (
      <motion.div
        layoutId={`thread-${thread.id}`}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-8"
        style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-4xl h-full max-h-[90vh] bg-white border border-[hsl(220,13%,91%)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          layoutId={`thread-card-${thread.id}`}
        >
          <div className="p-6 border-b border-[hsl(220,13%,91%)] flex items-start justify-between bg-[hsl(210,40%,96%)]/30">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[hsl(222,47%,11%)]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[hsl(222,47%,11%)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[hsl(224,71%,4%)]">{thread.sender}</h3>
                  <p className="text-sm text-[hsl(215,20%,65%)]">{thread.senderEmail}</p>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[hsl(224,71%,4%)] mb-2">{thread.subject}</h2>
              <div className="flex items-center gap-3 text-sm text-[hsl(215,20%,65%)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {thread.timestamp}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {thread.messageCount} messages
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-[hsl(210,40%,96%)]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-gradient-to-br from-[hsl(222,47%,11%)]/5 to-[hsl(222,47%,11%)]/10 border border-[hsl(222,47%,11%)]/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[hsl(222,47%,11%)]" />
                <h3 className="font-semibold text-[hsl(224,71%,4%)]">AI Insights</h3>
                <Badge className={`ml-auto ${sentimentColors[thread.aiInsights.sentiment]}`}>
                  {thread.aiInsights.sentiment}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-[hsl(215,20%,65%)] mb-2">Summary</h4>
                  <p className="text-[hsl(224,71%,4%)]">{thread.aiInsights.summary}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-[hsl(215,20%,65%)] mb-2">Key Points</h4>
                  <ul className="space-y-1">
                    {thread.aiInsights.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[hsl(224,71%,4%)]">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-[hsl(222,47%,11%)] flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-[hsl(215,20%,65%)] mb-2">Suggested Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {thread.aiInsights.suggestedActions.map((action, idx) => (
                      <Badge key={idx} variant="outline" className="bg-white">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6 bg-[hsl(210,40%,96%)]/30">
              <h4 className="font-semibold text-[hsl(224,71%,4%)] mb-3">Message Content</h4>
              <div className="whitespace-pre-wrap text-[hsl(224,71%,4%)] leading-relaxed">
                {thread.fullContent}
              </div>
            </Card>

            {showReply && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[hsl(210,40%,96%)]/30 border border-[hsl(220,13%,91%)] rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[hsl(222,47%,11%)]" />
                  <span className="text-sm font-medium text-[hsl(215,20%,65%)]">
                    AI-assisted reply
                  </span>
                </div>
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                  className="min-h-[120px] mb-3 bg-white"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[hsl(222,47%,11%)] text-white">
                    Send Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowReply(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-6 border-t border-[hsl(220,13%,91%)] bg-[hsl(210,40%,96%)]/30 flex gap-3">
            <Button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-2 bg-[hsl(222,47%,11%)] text-white hover:bg-[hsl(222,47%,11%)]/90"
            >
              <Reply className="w-4 h-4" />
              Quick Reply
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Forward className="w-4 h-4" />
              Forward
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Summarize
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={`thread-card-${thread.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onExpand}
      className="cursor-pointer"
    >
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[hsl(222,47%,11%)]/50 bg-white">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[hsl(222,47%,11%)]/5 to-transparent opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(222,47%,11%)]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-[hsl(222,47%,11%)]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[hsl(224,71%,4%)] truncate">
                      {thread.subject}
                    </h3>
                    {thread.unread && (
                      <div className="w-2 h-2 rounded-full bg-[hsl(222,47%,11%)] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-[hsl(215,20%,65%)]">{thread.sender}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-[hsl(215,20%,65%)] whitespace-nowrap">
                    {thread.timestamp}
                  </span>
                  {thread.messageCount > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      {thread.messageCount}
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-sm text-[hsl(215,20%,65%)] line-clamp-2 mb-3">
                {thread.preview}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                {thread.labels.map((label) => (
                  <Badge key={label} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Separator className="mb-4" />
                <div className="bg-[hsl(210,40%,96%)]/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[hsl(222,47%,11%)]" />
                    <span className="text-xs font-medium text-[hsl(215,20%,65%)]">
                      AI Summary
                    </span>
                  </div>
                  <p className="text-sm text-[hsl(224,71%,4%)] line-clamp-2">
                    {thread.aiInsights.summary}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                      <Forward className="w-3 h-3 mr-1" />
                      Forward
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

/* ================================================================== */
/*  EmailThreadTimeline — verbatim from pasted source                  */
/* ================================================================== */

const EmailThreadTimeline: React.FC<{ threads?: EmailThread[] }> = ({
  threads = defaultThreads
}) => {
  const [expandedThread, setExpandedThread] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[hsl(224,71%,4%)] mb-2">Inbox</h1>
          <p className="text-[hsl(215,20%,65%)]">
            AI-powered email management with intelligent insights
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
          <AnimatePresence mode="wait">
            {!expandedThread ? (
              threads.map((thread) => (
                <div key={thread.id} className="flex-shrink-0 w-[450px] snap-center">
                  <EmailThreadCard
                    thread={thread}
                    isExpanded={false}
                    onExpand={() => setExpandedThread(thread.id)}
                    onClose={() => {}}
                  />
                </div>
              ))
            ) : (
              <EmailThreadCard
                key={expandedThread}
                thread={threads.find((t) => t.id === expandedThread)!}
                isExpanded={true}
                onExpand={() => {}}
                onClose={() => setExpandedThread(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/*  PAGE EXPORT                                                        */
/* ================================================================== */

export default function Variant1DemoPage() {
  return <EmailThreadTimeline />;
}
