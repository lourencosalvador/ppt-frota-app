"use client";

import { useMemo, useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  Clock3,
  Download,
  FileDown,
  Filter,
  PieChart as PieIcon,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  costSeries,
  kpiCards,
  slaPerformance,
  ticketsRows,
  type GestorTicketRow,
} from "@/app/(gestor)/gestor/lib/mock-overview";
import {
  applyRange,
  distributionFromRows,
  rangeLabel,
  type OverviewRange,
} from "@/app/(gestor)/gestor/lib/overview-utils";

function cardTheme(iconClass: string) {
  if (iconClass.includes("text-blue-700")) return "shadow-[0_4px_20px_rgb(59,130,246,0.04)] border-blue-100/10";
  if (iconClass.includes("text-emerald-700")) return "shadow-[0_4px_20px_rgb(16,185,129,0.04)] border-emerald-100/10";
  if (iconClass.includes("text-amber-700")) return "shadow-[0_4px_20px_rgb(245,158,11,0.04)] border-amber-100/10";
  if (iconClass.includes("text-red-600")) return "shadow-[0_4px_20px_rgb(239,68,68,0.04)] border-red-100/20";
  return "shadow-sm border-zinc-100";
}

function statusBadgeClass(status: GestorTicketRow["status"]) {
  if (status === "ABERTO") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "EM ANÁLISE") return "bg-amber-50 text-amber-800 border-amber-100";
  if (status === "ATRIBUÍDO") return "bg-zinc-50 text-zinc-700 border-zinc-200";
  if (status === "CONCLUÍDO") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  return "bg-violet-50 text-violet-700 border-violet-100";
}

function attentionDot(level: GestorTicketRow["attentionLevel"]) {
  if (level === "high") return "bg-red-500";
  if (level === "medium") return "bg-amber-500";
  return "bg-zinc-300";
}

type TabKey = "ATENCAO" | "PENDENTES" | "EM_CURSO" | "CONCLUIDOS";

function tabMetaClasses(tab: TabKey) {
  if (tab === "ATENCAO") return { date: "text-red-600", sla: "text-red-500" };
  if (tab === "CONCLUIDOS") return { date: "text-zinc-600", sla: "text-zinc-400" };
  return { date: "text-zinc-600", sla: "text-zinc-400" };
}

export default function GestorOverviewClient() {
  const [tab, setTab] = useState<TabKey>("ATENCAO");
  const [range, setRange] = useState<OverviewRange>("MONTH");
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null);

  const now = useMemo(() => new Date(Date.UTC(2024, 4, 21, 12, 0, 0)), []);
  const filteredRows = useMemo(() => applyRange(ticketsRows, range, now), [range, now]);
  const distribution = useMemo(() => distributionFromRows(filteredRows), [filteredRows]);
  const filterText = useMemo(() => rangeLabel(range), [range]);

  const categorized = useMemo(() => {
    const completed = filteredRows.filter((r) => r.status === "CONCLUÍDO");
    const attention = filteredRows.filter((r) => {
      if (r.status === "CONCLUÍDO") return false;
      return r.slaLabel.toUpperCase().includes("ATRASADO") || r.attentionLevel !== "low";
    });
    const pending = filteredRows.filter((r) => {
      if (r.status !== "ABERTO") return false;
      return !attention.some((a) => a.id === r.id);
    });
    const inProgress = filteredRows.filter((r) => {
      if (r.status === "CONCLUÍDO") return false;
      if (r.status === "ABERTO") return false;
      return !attention.some((a) => a.id === r.id);
    });
    return { attention, pending, inProgress, completed };
  }, [filteredRows]);

  const tabs = useMemo(() => {
    return [
      {
        key: "ATENCAO" as const,
        label: "Atenção",
        count: categorized.attention.length,
        icon: CircleAlert,
        activeText: "text-red-600",
        activeUnderline: "bg-red-500",
      },
      {
        key: "PENDENTES" as const,
        label: "Pendentes",
        count: categorized.pending.length,
        icon: Clock3,
        activeText: "text-zinc-900",
        activeUnderline: "bg-zinc-300",
      },
      {
        key: "EM_CURSO" as const,
        label: "Em Curso",
        count: categorized.inProgress.length,
        icon: Zap,
        activeText: "text-amber-700",
        activeUnderline: "bg-amber-500",
      },
      {
        key: "CONCLUIDOS" as const,
        label: "Concluídos",
        count: categorized.completed.length,
        icon: CircleCheck,
        activeText: "text-emerald-700",
        activeUnderline: "bg-emerald-500",
      },
    ];
  }, [categorized]);

  const rows = useMemo(() => {
    if (tab === "ATENCAO") return categorized.attention;
    if (tab === "PENDENTES") return categorized.pending;
    if (tab === "EM_CURSO") return categorized.inProgress;
    return categorized.completed;
  }, [tab, categorized]);

  async function exportExcel() {
    if (exporting) return;
    setExporting("xlsx");
    try {
      const XLSX = await import("xlsx");
      const data = rows.map((r) => ({
        Código: r.code,
        Assunto: r.subject,
        Tipo: r.type,
        Solicitante: `${r.requesterName} (${r.requesterRole})`,
        Data: r.date,
        SLA: r.slaLabel,
        Status: r.status,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tickets");
      const fileName = `gestor-visao-geral-${filterText.replace(/\s+/g, "-").toLowerCase()}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success("Exportação Excel gerada.");
    } catch {
      toast.error("Falha ao exportar Excel.");
    } finally {
      setExporting(null);
    }
  }

  async function exportPdf() {
    if (exporting) return;
    setExporting("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

      const page = {
        w: doc.internal.pageSize.getWidth(),
        h: doc.internal.pageSize.getHeight(),
        margin: 40,
      };

      const colors = {
        ink: [15, 23, 42] as const,
        muted: [100, 116, 139] as const,
        border: [228, 228, 231] as const,
        bg: [248, 250, 252] as const,
        blue: [37, 99, 235] as const,
        emerald: [16, 185, 129] as const,
        amber: [245, 158, 11] as const,
        red: [239, 68, 68] as const,
      };

      function rrect(x: number, y: number, w: number, h: number, r: number) {
        doc.roundedRect(x, y, w, h, r, r);
      }

      function setFill(rgb: readonly [number, number, number]) {
        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      }

      function setDraw(rgb: readonly [number, number, number]) {
        doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      }

      function setText(rgb: readonly [number, number, number]) {
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      }

      function clipText(text: string, maxChars: number) {
        const t = text.trim();
        return t.length > maxChars ? `${t.slice(0, maxChars - 1)}…` : t;
      }

      const generatedAt = new Date();
      const generatedAtLabel = `${generatedAt.getFullYear()}-${String(generatedAt.getMonth() + 1).padStart(2, "0")}-${String(
        generatedAt.getDate(),
      ).padStart(2, "0")} ${String(generatedAt.getHours()).padStart(2, "0")}:${String(generatedAt.getMinutes()).padStart(2, "0")}`;

      function drawCoverHeader() {
        const x = page.margin;
        const y = page.margin;
        const w = page.w - page.margin * 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        setText(colors.ink);
        doc.text("Visão Geral da Operação", x, y + 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        setText(colors.muted);
        doc.text("Monitorização em tempo real de tickets, SLAs e eficiência da frota.", x, y + 38);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        setText(colors.muted);
        doc.text(`Filtro: ${filterText}`, x, y + 60);
        doc.text(`Gerado em: ${generatedAtLabel}`, x + w - doc.getTextWidth(`Gerado em: ${generatedAtLabel}`), y + 60);

        doc.setLineWidth(1);
        setDraw(colors.border);
        doc.line(x, y + 74, x + w, y + 74);

        return y + 92;
      }

      function drawPageHeaderSmall() {
        const x = page.margin;
        const w = page.w - page.margin * 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        setText(colors.ink);
        doc.text("Visão Geral da Operação", x, page.margin);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setText(colors.muted);
        doc.text(`Filtro: ${filterText} • ${generatedAtLabel}`, x, page.margin + 14);
        setDraw(colors.border);
        doc.setLineWidth(1);
        doc.line(x, page.margin + 24, x + w, page.margin + 24);
        return page.margin + 40;
      }

      function drawKpis(startY: number) {
        const x = page.margin;
        const w = page.w - page.margin * 2;
        const gap = 10;
        const cardW = (w - gap * 3) / 4;
        const h = 74;

        const total = filteredRows.length;
        const aberto = filteredRows.filter((r) => r.status === "ABERTO").length;
        const analise = filteredRows.filter((r) => r.status === "EM ANÁLISE").length;
        const aproxSla = slaPerformance.value;

        const kpis = [
          { label: "Tickets (Filtro)", value: String(total), accent: colors.red },
          { label: "Abertos", value: String(aberto), accent: colors.blue },
          { label: "Em Análise", value: String(analise), accent: colors.amber },
          { label: "SLA", value: `${aproxSla.toFixed(1)}%`, accent: colors.emerald },
        ] as const;

        for (let i = 0; i < 4; i++) {
          const cx = x + i * (cardW + gap);
          const cy = startY;
          doc.setLineWidth(1);
          setDraw(colors.border);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(cx, cy, cardW, h, 14, 14, "FD");

          setFill(kpis[i].accent);
          doc.roundedRect(cx + 14, cy + 14, 34, 34, 12, 12, "F");
          doc.setFillColor(255, 255, 255);
          doc.circle(cx + 31, cy + 31, 8.5, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          setText(colors.ink);
          doc.text(kpis[i].value, cx + 14, cy + 62);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          setText(colors.muted);
          doc.text(kpis[i].label, cx + 14, cy + 72);
        }

        return startY + h + 18;
      }

      function makeLineChartPng() {
        const canvas = document.createElement("canvas");
        canvas.width = 880;
        canvas.height = 280;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const data = costSeries;
        const pad = 28;
        const w = canvas.width;
        const h = canvas.height;
        const innerW = w - pad * 2;
        const innerH = h - pad * 2;
        const max = Math.max(...data.map((d) => d.value), 1);
        const min = Math.min(...data.map((d) => d.value), 0);
        const span = Math.max(max - min, 1);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "#e4e4e7";
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          const y = pad + (i * innerH) / 3;
          ctx.beginPath();
          ctx.moveTo(pad, y);
          ctx.lineTo(pad + innerW, y);
          ctx.stroke();
        }

        const pts = data.map((d, i) => {
          const x = pad + (i * innerW) / Math.max(data.length - 1, 1);
          const y = pad + ((max - d.value) * innerH) / span;
          return { x, y };
        });

        const grad = ctx.createLinearGradient(0, pad, 0, pad + innerH);
        grad.addColorStop(0, "rgba(16,185,129,0.22)");
        grad.addColorStop(1, "rgba(16,185,129,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pad + innerH);
        for (const p of pts) ctx.lineTo(p.x, p.y);
        ctx.lineTo(pts[pts.length - 1].x, pad + innerH);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        return canvas.toDataURL("image/png");
      }

      function makeDonutPng() {
        const canvas = document.createElement("canvas");
        canvas.width = 360;
        canvas.height = 360;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const data = distribution.length ? distribution : [{ name: "Sem dados", value: 1, color: "#e4e4e7" }];
        const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const outer = 140;
        const inner = 92;
        let start = -Math.PI / 2;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const seg of data) {
          const ang = (seg.value / total) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, outer, start, start + ang);
          ctx.closePath();
          ctx.fillStyle = seg.color;
          ctx.fill();
          start += ang;
        }

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(cx, cy, inner, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";

        return canvas.toDataURL("image/png");
      }

      function drawSectionTitle(y: number, title: string) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        setText(colors.ink);
        doc.text(title, page.margin, y);
        setDraw(colors.border);
        doc.setLineWidth(1);
        doc.line(page.margin, y + 6, page.w - page.margin, y + 6);
        return y + 10;
      }

      function drawCharts(startY: number) {
        let y = startY;
        y = drawSectionTitle(y, "Gráficos");
        y += 6;

        const linePng = makeLineChartPng();
        const donutPng = makeDonutPng();
        const x = page.margin;
        const w = page.w - page.margin * 2;
        const gap = 14;
        const leftW = Math.round(w * 0.62);
        const rightW = w - leftW - gap;
        const boxH = 220;

        doc.setLineWidth(1);
        setDraw(colors.border);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, leftW, boxH, 16, 16, "FD");
        doc.roundedRect(x + leftW + gap, y, rightW, boxH, 16, 16, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        setText(colors.ink);
        doc.text("Custo Diário da Frota", x + 16, y + 24);
        doc.text("Distribuição de Volume", x + leftW + gap + 16, y + 24);

        if (linePng) {
          doc.addImage(linePng, "PNG", x + 12, y + 38, leftW - 24, 150);
        }
        if (donutPng) {
          const size = Math.min(rightW - 24, 150);
          doc.addImage(donutPng, "PNG", x + leftW + gap + (rightW - size) / 2, y + 44, size, size);
        }

        const legendY = y + 190;
        const items = distribution.slice(0, 4);
        let lx = x + leftW + gap + 16;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        setText(colors.muted);
        for (const s of items) {
          doc.setFillColor(
            Number.parseInt(s.color.slice(1, 3), 16),
            Number.parseInt(s.color.slice(3, 5), 16),
            Number.parseInt(s.color.slice(5, 7), 16),
          );
          doc.circle(lx + 4, legendY - 4, 3, "F");
          setText(colors.muted);
          doc.text(`${s.name} (${s.value})`, lx + 12, legendY);
          lx += doc.getTextWidth(`${s.name} (${s.value})`) + 18;
          if (lx > x + leftW + gap + rightW - 80) break;
        }

        return y + boxH + 18;
      }

      function drawTable(startY: number) {
        let y = startY;
        y = drawSectionTitle(y, "Tickets");
        y += 10;

        const x = page.margin;
        const w = page.w - page.margin * 2;
        const headerH = 28;
        const rowH = 22;

        const cols = [
          { key: "code", label: "CÓDIGO", w: 92 },
          { key: "status", label: "STATUS", w: 84 },
          { key: "date", label: "DATA", w: 72 },
          { key: "requester", label: "SOLICITANTE", w: 110 },
          { key: "subject", label: "ASSUNTO", w: w - (92 + 84 + 72 + 110) },
        ] as const;

        function drawTableHeader(atY: number) {
          doc.setLineWidth(1);
          setDraw(colors.border);
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(x, atY, w, headerH, 10, 10, "FD");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          setText(colors.muted);

          let cx = x + 10;
          for (const c of cols) {
            doc.text(c.label, cx, atY + 18);
            cx += c.w;
          }
          return atY + headerH;
        }

        y = drawTableHeader(y);

        const all = filteredRows;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setText(colors.ink);

        for (let i = 0; i < all.length; i++) {
          const r = all[i];
          if (y + rowH > page.h - page.margin) {
            doc.addPage();
            y = drawPageHeaderSmall();
            y = drawTableHeader(y);
          }

          const zebra = i % 2 === 1;
          doc.setFillColor(zebra ? 250 : 255, zebra ? 250 : 255, zebra ? 252 : 255);
          doc.rect(x, y, w, rowH, "F");
          setDraw(colors.border);
          doc.line(x, y, x + w, y);

          const vals = {
            code: r.code,
            status: r.status,
            date: r.date,
            requester: `${r.requesterName}`,
            subject: r.subject,
          } as const;

          let cx = x + 10;
          setText(colors.ink);
          doc.text(clipText(vals.code, 14), cx, y + 15);
          cx += cols[0].w;

          setText(colors.muted);
          doc.text(clipText(vals.status, 14), cx, y + 15);
          cx += cols[1].w;

          setText(colors.muted);
          doc.text(clipText(vals.date, 12), cx, y + 15);
          cx += cols[2].w;

          setText(colors.ink);
          doc.text(clipText(vals.requester, 18), cx, y + 15);
          cx += cols[3].w;

          setText(colors.ink);
          doc.text(clipText(vals.subject, 54), cx, y + 15);

          y += rowH;
        }
        doc.line(x, y, x + w, y);

        return y + 10;
      }

      let cursorY = drawCoverHeader();
      cursorY = drawKpis(cursorY);
      cursorY = drawCharts(cursorY);
      drawTable(cursorY);

      const pages = doc.getNumberOfPages();
      for (let p = 1; p <= pages; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setText(colors.muted);
        const footer = `Frota+ • Relatório • Página ${p} de ${pages}`;
        doc.text(footer, page.margin, page.h - 22);
      }

      const fileName = `gestor-visao-geral-${filterText.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      doc.save(fileName);
      toast.success("Relatório PDF gerado.");
    } catch {
      toast.error("Falha ao gerar PDF.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-extrabold text-zinc-900">Visão Geral da Operação</div>
            <div className="mt-1 text-sm font-semibold text-zinc-500">
              Monitorização em tempo real de tickets, SLAs e eficiência da frota.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="h-11 rounded-2xl">
                  <Filter className="h-4 w-4 text-zinc-600" />
                  Filtro:
                  <span className="font-extrabold text-zinc-900">{filterText}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRange("MONTH")}>Este Mês</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRange("LAST_7")}>Últimos 7 dias</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRange("TODAY")}>Hoje</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              onClick={exportExcel}
              disabled={exporting !== null}
            >
              <Download className="h-4 w-4" />
              {exporting === "xlsx" ? "A exportar..." : "Exportar Excel"}
            </Button>
            <Button
              type="button"
              className="h-11 rounded-2xl bg-[#0B1220] px-6 hover:bg-[#0E2236]"
              onClick={exportPdf}
              disabled={exporting !== null}
            >
              <FileDown className="h-4 w-4" />
              {exporting === "pdf" ? "A gerar..." : "Relatório PDF"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((c, i) => {
          const Icon = c.icon;
          const theme = cardTheme(c.iconClass);
          return (
            <div
              key={i}
              className={`rounded-2xl border bg-white p-5 transition-all ${theme}`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.iconBgClass} ${c.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold ${c.pillClass}`}>
                  {c.pillLabel}
                </span>
              </div>
              <div className="mt-5 text-2xl font-extrabold text-zinc-900">{c.value}</div>
              <div className="mt-1 text-xs font-semibold text-zinc-500">{c.title}</div>
              <div className="mt-1 text-[10px] font-semibold text-zinc-300">{c.subtitle}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="border-b border-zinc-100 px-6 py-5">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-extrabold text-zinc-900">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  Gestão de Solicitações
                </div>
                <div className="mt-1 text-[11px] font-semibold text-zinc-400">
                  Visão unificada de todos os estados do workflow.
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-100 px-6">
            <div className="flex flex-wrap gap-8">
              {tabs.map((t) => {
                const active = tab === t.key;
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={[
                      "relative cursor-pointer py-4 text-sm font-extrabold",
                      active ? t.activeText : "text-zinc-500 hover:text-zinc-700",
                    ].join(" ")}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon
                        className={[
                          "h-4 w-4",
                          active ? t.activeText : "text-zinc-400",
                        ].join(" ")}
                      />
                      <span className="font-extrabold">{t.label}</span>
                      <span className="text-zinc-400">({t.count})</span>
                    </span>
                    {active ? (
                      <span className={`absolute inset-x-0 bottom-0 h-0.5 ${t.activeUnderline}`} />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="grid grid-cols-[1fr_160px_140px_140px] gap-4 border-b border-zinc-100 bg-zinc-50/40 px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
              <div>Ticket / Assunto</div>
              <div>Solicitante</div>
              <div>Data</div>
              <div>Status</div>
            </div>

            <div className="divide-y divide-zinc-100">
              {rows.length === 0 ? (
                <div className="px-6 py-16 text-center text-sm font-semibold text-zinc-400">
                  Sem registos para este estado.
                </div>
              ) : (
                rows.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[1fr_160px_140px_140px] gap-4 px-6 py-5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <span
                          className={[
                            "mt-1.5 h-2 w-2 rounded-full",
                            tab === "CONCLUIDOS" ? "bg-emerald-500" : attentionDot(r.attentionLevel),
                          ].join(" ")}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold text-zinc-900">
                            {r.subject}
                          </div>
                          <div className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                            {r.code} <span className="text-zinc-300">•</span> {r.type}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-zinc-700">
                      <div>{r.requesterName}</div>
                      <div className="text-xs font-semibold text-zinc-400">{r.requesterRole}</div>
                    </div>

                    <div className="text-sm font-semibold text-zinc-700">
                      <div className={tabMetaClasses(tab).date}>{r.date}</div>
                      {r.slaLabel ? (
                        <div className={`text-[11px] font-extrabold ${tabMetaClasses(tab).sla}`}>
                          {r.slaLabel}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${statusBadgeClass(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-zinc-100 px-6 py-4">
              <button type="button" className="text-xs font-extrabold text-emerald-700 hover:underline">
                Ver todos os tickets ↗
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <div className="text-sm font-extrabold text-zinc-900">Custo Diário da Frota</div>
            <div className="mt-4 h-[170px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costSeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip
                    cursor={{ stroke: "#e4e4e7", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#e4e4e7",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#fillCost)"
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <div className="text-sm font-extrabold text-zinc-900">Distribuição de Volume</div>
            <div className="mt-5 grid grid-cols-1 gap-5">
              <div className="mx-auto h-[190px] w-full max-w-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={86}
                      paddingAngle={3}
                      stroke="transparent"
                    >
                      {distribution.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-5">
                {distribution.slice(0, 3).map((s) => (
                  <div key={s.name} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-linear-to-b from-[#0B1220] to-[#0E2236] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-red-300/80">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/8 text-red-300">
                <PieIcon className="h-4 w-4" />
              </span>
              Performance de SLA
            </div>
            <div className="mt-4 text-3xl font-extrabold text-white">{slaPerformance.value.toFixed(1)}%</div>
            <div className="mt-2 text-sm font-semibold text-white/55">{slaPerformance.subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

