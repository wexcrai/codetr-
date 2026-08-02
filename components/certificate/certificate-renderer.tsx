"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, Share2, CheckCircle2 } from "lucide-react";

interface CertificateProps {
  userName: string;
  courseName: string;
  completionDate: string;
  verificationId: string;
}

export function CertificateRenderer({
  userName,
  courseName,
  completionDate,
  verificationId,
}: CertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `codetr-sertifika-${verificationId.slice(0, 8)}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/sertifika/dogrula?id=${verificationId}`;
    if (navigator.share) {
      await navigator.share({ title: "CodeTR Sertifikam", url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Sertifika bağlantısı panoya kopyalandı!");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 850;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGrad.addColorStop(0, "#0A0F1E");
    bgGrad.addColorStop(1, "#0F172A");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 850);

    // Border gradient
    const borderGrad = ctx.createLinearGradient(0, 0, 1200, 0);
    borderGrad.addColorStop(0, "#3B82F6");
    borderGrad.addColorStop(0.5, "#8B5CF6");
    borderGrad.addColorStop(1, "#3B82F6");
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 1160, 810);

    // Inner border
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, 1140, 790);

    // Logo area
    ctx.font = "bold 48px system-ui";
    const logoGrad = ctx.createLinearGradient(0, 0, 300, 0);
    logoGrad.addColorStop(0, "#3B82F6");
    logoGrad.addColorStop(1, "#8B5CF6");
    ctx.fillStyle = logoGrad;
    ctx.textAlign = "center";
    ctx.fillText("{ CodeTR }", 600, 110);

    // Certificate title
    ctx.font = "28px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("BAŞARI SERTİFİKASI", 600, 165);

    // Divider line
    const divGrad = ctx.createLinearGradient(300, 0, 900, 0);
    divGrad.addColorStop(0, "transparent");
    divGrad.addColorStop(0.5, "rgba(59,130,246,0.5)");
    divGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(300, 195);
    ctx.lineTo(900, 195);
    ctx.stroke();

    // "Bu belge ile tescil edilmiştir ki:"
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("Bu belge ile tescil edilmiştir ki:", 600, 270);

    // User name
    ctx.font = "bold 64px Georgia, serif";
    const nameGrad = ctx.createLinearGradient(0, 300, 1200, 350);
    nameGrad.addColorStop(0, "#60A5FA");
    nameGrad.addColorStop(1, "#A78BFA");
    ctx.fillStyle = nameGrad;
    ctx.fillText(userName, 600, 355);

    // "başarıyla tamamlamıştır:"
    ctx.font = "22px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("aşağıdaki kursu başarıyla tamamlamıştır:", 600, 415);

    // Course name
    ctx.font = "bold 44px system-ui";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(courseName, 600, 485);

    // Python course badge
    ctx.beginPath();
    const badgeGrad = ctx.createLinearGradient(500, 510, 700, 560);
    badgeGrad.addColorStop(0, "rgba(59,130,246,0.3)");
    badgeGrad.addColorStop(1, "rgba(139,92,246,0.3)");
    ctx.fillStyle = badgeGrad;
    ctx.roundRect(475, 510, 250, 50, 25);
    ctx.fill();
    ctx.strokeStyle = "rgba(59,130,246,0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "18px system-ui";
    ctx.fillStyle = "#93C5FD";
    ctx.fillText("Programlama Sertifikası", 600, 541);

    // Divider
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 600);
    ctx.lineTo(1000, 600);
    ctx.stroke();

    // Footer info
    ctx.font = "16px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.textAlign = "left";
    ctx.fillText("Tamamlanma Tarihi:", 200, 660);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText(formatDate(completionDate), 200, 685);

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.textAlign = "right";
    ctx.fillText("Doğrulama ID:", 1000, 660);
    ctx.font = "14px monospace";
    ctx.fillStyle = "#60A5FA";
    ctx.fillText(verificationId, 1000, 685);

    ctx.font = "12px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.textAlign = "center";
    ctx.fillText(
      `Bu sertifikayı doğrulamak için: codetr.dev/sertifika/dogrula?id=${verificationId}`,
      600,
      760
    );
  }, [userName, courseName, completionDate, verificationId]);

  return (
    <div className="flex flex-col items-center gap-6">
      <canvas
        ref={canvasRef}
        className="w-full max-w-3xl rounded-xl shadow-2xl border border-white/10"
        style={{ aspectRatio: "1200/850" }}
      />
      <div className="flex gap-4">
        <Button onClick={handleDownload} className="gradient-bg gap-2">
          <Download className="h-4 w-4" />
          Sertifikayı İndir (PNG)
        </Button>
        <Button variant="outline" onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          Paylaş
        </Button>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span>
          Doğrulama ID: <code className="text-blue-400">{verificationId}</code>
        </span>
      </div>
    </div>
  );
}
