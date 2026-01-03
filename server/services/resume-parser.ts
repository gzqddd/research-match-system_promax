/**
 * 简历解析服务
 * 负责从PDF文件中提取文本内容
 *
 * 实现：使用 pdfjs-dist（原生ESM支持）在 Node 环境中解析 PDF 文本
 */

// 使用 pdfjs-dist 的 ESM 版本
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export interface ParseResult {
  text: string;
  pages: number;
  info?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
  };
}

/**
 * 从PDF Buffer中提取文本
 * @param pdfBuffer PDF文件的Buffer
 * @returns 解析结果，包含文本内容和元数据
 */
export async function parsePDF(pdfBuffer: Buffer | Uint8Array): Promise<ParseResult> {
  try {
    // pdfjs-dist 要求使用 Uint8Array，而不是 Node.js Buffer
    const uint8Data = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);

    // 使用 pdfjs-dist 加载 PDF 文档
    const loadingTask = pdfjsLib.getDocument({ data: uint8Data });
    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const strings = content.items
        .map((item: any) => {
          // item.str 是常见字段，其他情况兜底为字符串
          if (typeof item.str === "string") return item.str;
          return String((item as any).toString?.() ?? "");
        })
        .filter((s) => s && s.trim().length > 0);

      fullText += strings.join(" ") + "\n";
    }

    fullText = fullText.trim();

    if (!fullText) {
      throw new Error("PDF中未提取到任何文本内容（可能是纯图片扫描件）");
    }

    return {
      text: fullText,
      pages: pdf.numPages,
      info: {
        // pdfjs 在 Node 场景下获取元数据较复杂，这里先留空
        title: undefined,
        author: undefined,
        subject: undefined,
        creator: undefined,
      },
    };
  } catch (error) {
    throw new Error(`PDF解析失败: ${error instanceof Error ? error.message : "未知错误"}`);
  }
}

/**
 * 从Base64字符串解析PDF
 * @param base64String Base64编码的PDF文件
 * @returns 解析结果
 */
export async function parsePDFFromBase64(base64String: string): Promise<ParseResult> {
  // 移除data URL前缀（如果存在）
  const base64Data = base64String.includes(",") 
    ? base64String.split(",")[1] 
    : base64String;
  
  // 将Base64转换为 Uint8Array（pdfjs-dist 要求使用 Uint8Array）
  const buffer = Buffer.from(base64Data, "base64");
  const uint8Data = new Uint8Array(buffer);
  
  return parsePDF(uint8Data);
}

