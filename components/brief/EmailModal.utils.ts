export function formatThreadDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}, ${hh}:${mm}`;
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    return formatThreadDate(dateStr);
  } catch {
    return dateStr;
  }
}

/** Strip quoted replies, "Sent from..." footers, forwarded headers */
export function cleanBody(body: string): string {
  let text = body.replace(/^Body:\s*/i, "");
  text = text.replace(/[-]{3,}[\s\S]*/m, "");
  text = text.replace(/[_]{3,}[\s\S]*/m, "");
  text = text.replace(/On .{0,100}wrote:[\s\S]*/m, "");
  text = text.replace(/Forwarded message[\s\S]*/im, "");
  const lines = text.split("\n");
  const cleaned: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("Sent from")) break;
    if (t.startsWith("From:") && t.includes("<")) break;
    if (t.startsWith(">")) continue;
    cleaned.push(line);
  }
  while (cleaned.length > 0 && cleaned[cleaned.length - 1].trim() === "") cleaned.pop();
  return cleaned.join("\n") || body;
}

/** Extract key points from narrative for the AI Insights panel */
export function extractKeyPoints(narrative: string): string[] {
  const sentences = narrative.match(/[^.!?]+[.!?]+/g);
  if (!sentences || sentences.length <= 1) return [];
  return sentences.slice(1).map((s) => s.trim()).filter((s) => s.length > 10).slice(0, 4);
}
