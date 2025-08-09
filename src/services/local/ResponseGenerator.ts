export class ResponseGenerator {
  build(intent: string, data: any[]): string {
    if (!data || data.length === 0) {
      return "I couldn't find results matching your request.";
    }

    switch (intent) {
      case 'list_projects':
      case 'project_details':
        return this.projects(data);
      case 'overdue_projects':
        return this.overdueProjects(data);
      case 'list_tasks':
      case 'overdue_tasks':
      case 'urgent_tasks':
        return this.tasks(data);
      case 'list_resources':
      case 'available_resources':
      case 'busy_resources':
        return this.resources(data);
      default:
        return this.projects(data);
    }
  }

  private projects(items: any[]): string {
    let out = `📁 Projects (${items.length})\n\n`;
    for (const p of items.slice(0,10)) {
      out += `• ${p.name} — ${p.status || 'Unknown'} — ${p.progress ?? 0}%\n`;
    }
    return out;
  }

  private overdueProjects(items: any[]): string {
    let out = `⏰ Overdue Projects (${items.length})\n\n`;
    for (const p of items.slice(0,10)) {
      out += `• ${p.name} — due ${p.end_date || 'N/A'} — ${p.progress ?? 0}%\n`;
    }
    return out;
  }

  private tasks(items: any[]): string {
    let out = `📝 Tasks (${items.length})\n\n`;
    for (const t of items.slice(0,15)) {
      out += `• ${t.name} — ${t.status} — ${t.priority}\n`;
    }
    return out;
  }

  private resources(items: any[]): string {
    let out = `👥 Resources (${items.length})\n\n`;
    for (const r of items.slice(0,15)) {
      out += `• ${r.name} — ${r.role || 'N/A'} — availability ${r.availability ?? 'N/A'}%\n`;
    }
    return out;
  }
}