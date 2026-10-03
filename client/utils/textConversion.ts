export function removeBoldMarkers(text: string): string {
    // Use a regular expression to replace all occurrences of **text** with just text
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  }