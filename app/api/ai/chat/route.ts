import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const SYSTEM_PROMPT = `Sen CodeTR'nin yapay zeka yardımcısısın. CodeTR, Türkçe bir kodlama eğitim platformudur.

Görevin:
- Kullanıcılara programlama konularında Türkçe yardım etmek
- Kod yazma, hata ayıklama ve kavramları açıklama konusunda destek vermek
- JavaScript, TypeScript, Python, HTML, CSS, React ve benzeri teknolojilerde rehberlik etmek
- Kodları açıklarken örnekler vermek
- Hataları tespit edip düzeltme önerileri sunmak

Kurallar:
- Yanıtlarını HER ZAMAN Türkçe ver
- Kod örnekleri için \`\`\`dil\`\`\` formatını kullan
- Kısa ve öz ol, gerektiğinde detaylı açıkla
- Teşvik edici ve samimi bir dil kullan
- Eğer bir şeyi bilmiyorsan dürüstçe belirt
- Kullanıcıya "sen" diyerek hitap et

Platformla ilgili:
- CodeTR'de kurslar, alıştırmalar ve başarımlar var
- Kullanıcılar XP kazanıp level atlıyor
- Günlük seri (streak) sistemi var`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const { messages, provider = "gemini" } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Geçersiz mesaj formatı" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;
    const history = messages.slice(0, -1);

    if (provider === "gemini") {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "Gemini API anahtarı yapılandırılmamış" }, { status: 500 });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_PROMPT,
      });

      const chat = model.startChat({
        history: history.map((msg: { role: string; content: string }) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessage(lastMessage);
      const text = result.response.text();

      return NextResponse.json({ content: text, provider: "gemini" });

    } else if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "OpenAI API anahtarı yapılandırılmamış" }, { status: 500 });
      }

      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((msg: { role: string; content: string }) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content || "";
      return NextResponse.json({ content, provider: "openai" });
    }

    return NextResponse.json({ error: "Geçersiz sağlayıcı" }, { status: 400 });

  } catch (error: any) {
    console.error("[AI_CHAT_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Bir hata oluştu, lütfen tekrar deneyin" },
      { status: 500 }
    );
  }
}
