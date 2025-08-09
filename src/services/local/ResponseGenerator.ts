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
    let out = `## 📁 Projects (${items.length})\n\n`;
    out += `| Name | Status | Progress | Start | End |\n`;
    out += `|---|---|---:|---|---|\n`;
    for (const p of items.slice(0, 20)) {
      const progress = `${p.progress ?? 0}%`;
      const start = p.start_date || p.computed_start_date || '-';
      const end = p.end_date || p.computed_end_date || '-';
      out += `| ${p.name || '-'} | ${p.status || 'Unknown'} | ${progress} | ${start} | ${end} |\n`;
    }
    out += `\n- Showing up to ${Math.min(items.length, 20)} items`;
    return out;
  }

  private overdueProjects(items: any[]): string {
    let out = `## ⏰ Overdue Projects (${items.length})\n\n`;
    out += `| Name | Due | Status | Progress |\n`;
    out += `|---|---|---|---:|\n`;
    for (const p of items.slice(0, 20)) {
      const progress = `${p.progress ?? 0}%`;
      out += `| ${p.name || '-'} | ${p.end_date || 'N/A'} | ${p.status || 'Unknown'} | ${progress} |\n`;
    }
    out += `\n- Showing up to ${Math.min(items.length, 20)} items`;
    return out;
  }

  private tasks(items: any[]): string {
    let out = `## 📝 Tasks (${items.length})\n\n`;
    out += `| Name | Status | Priority | Due | Progress |\n`;
    out += `|---|---|---|---|---:|\n`;
    for (const t of items.slice(0, 50)) {
      const progress = `${t.progress ?? 0}%`;
      out += `| ${t.name || '-'} | ${t.status || 'Unknown'} | ${t.priority || '-'} | ${t.end_date || '-'} | ${progress} |\n`;
    }
    out += `\n- Showing up to ${Math.min(items.length, 50)} items`;
    return out;
  }

  private resources(items: any[]): string {
    let out = `## 👥 Resources (${items.length})\n\n`;
    out += `| Name | Role | Availability |\n`;
    out += `|---|---|---:|\n`;
    for (const r of items.slice(0, 50)) {
      const avail = r.availability ?? 'N/A';
      out += `| ${r.name || '-'} | ${r.role || 'N/A'} | ${avail}% |\n`;
    }
    out += `\n- Showing up to ${Math.min(items.length, 50)} items`;
    return out;
  }

}