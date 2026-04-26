package org.example.pagamentos.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.*;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.*;
import com.itextpdf.layout.borders.*;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;
import org.example.pagamentos.DTO.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

@Service
public class PdfService {

    private final FileUploadService fileUploadService;

    public PdfService(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    private static final Color PRIMARY_COLOR = new DeviceRgb(128, 20, 40);
    private static final Color DARK_COLOR = new DeviceRgb(40, 10, 15);
    private static final Color LIGHT_GRAY = new DeviceRgb(245, 245, 245);
    private static final Color BORDER_COLOR = new DeviceRgb(200, 200, 200);

    public byte[] gerarOrcamentoPdf(OrcamentoCompletoDTO o) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdf = new PdfDocument(new PdfWriter(baos));
        Document doc = new Document(pdf, PageSize.A4);

        doc.setMargins(15, 15, 15, 15);

        PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        Table container = new Table(1)
                .useAllAvailableWidth()
                .setBorder(new SolidBorder(BORDER_COLOR, 1))
                .setPadding(10);

        Cell cell = new Cell().setBorder(Border.NO_BORDER);

        Div content = new Div();

        adicionarCabecalho(content, o, bold, font);
        adicionarPrestadorBanco(content, o, bold, font);
        adicionarEmpresa(content, o, bold, font);
        adicionarItens(content, o, bold, font);
        adicionarDescricaoPagamento(content, o, bold, font);
        adicionarResumo(content, o, bold, font);
        adicionarImagens(content, o, bold, font);

        cell.add(content);
        container.addCell(cell);
        doc.add(container);

        doc.close();
        return baos.toByteArray();
    }

    // ================= CABEÇALHO =================
    private void adicionarCabecalho(Div c, OrcamentoCompletoDTO o,
                                    PdfFont bold, PdfFont font) {

        Table t = new Table(new float[]{1, 2, 1}).useAllAvailableWidth();

        try {
            Image logo = new Image(ImageDataFactory.create(
                    new ClassPathResource("images/logo.png").getURL()))
                    .scaleToFit(80, 40); // 🔥 AUMENTADO

            t.addCell(new Cell().add(logo).setBorder(Border.NO_BORDER));
        } catch (Exception e) {
            t.addCell(new Cell().add(new Paragraph("LOGO")));
        }

        t.addCell(new Cell().add(new Paragraph()
                        .add(new Text(o.getRazaoEmpresa()).setFont(bold).setFontSize(11))
                        .add(new Text(" | CNPJ: " + o.getCnpjEmpresa()).setFont(font).setFontSize(8)))
                .setBorder(Border.NO_BORDER));

        String data = o.getMovimento() != null ?
                o.getMovimento().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";

        t.addCell(new Cell().add(new Paragraph()
                        .add(new Text("Nº " + o.getOrcamentoID()).setFont(bold))
                        .add(new Text(" | " + data).setFont(font))
                        .setTextAlignment(TextAlignment.RIGHT))
                .setBorder(Border.NO_BORDER));

        c.add(t);
        c.add(new LineSeparator(new SolidLine(0.5f)));
    }

    // ================= PRESTADOR =================
    private void adicionarPrestadorBanco(Div c, OrcamentoCompletoDTO o,
                                         PdfFont bold, PdfFont font) {

        Table t = new Table(2).useAllAvailableWidth();

        t.addCell(cellTexto("PRESTADOR: " + o.getNomePrestador() +
                " | CPF: " + o.getCpfPrestador(), font));

        var b = o.getDadosBancarios();

        String banco = b != null ?
                "BANCO: " + b.getBanco() +
                        " | Ag: " + b.getAgencia() +
                        " | CC: " + b.getConta() +
                        " | PIX: " + b.getChavePix()
                : "Dados bancários não informados";

        t.addCell(cellTexto(banco, font));

        c.add(t);
    }

    // ================= EMPRESA =================
    private void adicionarEmpresa(Div c, OrcamentoCompletoDTO o,
                                  PdfFont bold, PdfFont font) {

        String endereco = o.getEnderecoEmpresa() != null ?
                o.getEnderecoEmpresa().getLogradouro() + ", " +
                        o.getEnderecoEmpresa().getCidade()
                : "Endereço não informado";

        c.add(cellTexto("EMPRESA: " + o.getRazaoEmpresa() +
                " | CNPJ: " + o.getCnpjEmpresa() +
                " | " + endereco, font));
    }

    // ================= ITENS =================
    private void adicionarItens(Div c, OrcamentoCompletoDTO o,
                                PdfFont bold, PdfFont font) {

        c.add(new Paragraph("ITENS DO ORÇAMENTO")
                .setFont(bold).setFontColor(PRIMARY_COLOR).setFontSize(9));

        Table t = new Table(new float[]{8, 35, 15, 10, 15, 17})
                .useAllAvailableWidth();

        String[] headers = {"#", "DESCRIÇÃO", "VALOR UNIT.", "QTD", "DESCONTO UN.", "TOTAL"};

        for (String h : headers) {
            t.addHeaderCell(new Cell()
                    .add(new Paragraph(h).setFont(bold).setFontSize(7).setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(PRIMARY_COLOR)
                    .setBorder(new SolidBorder(ColorConstants.WHITE, 0.5f)) // 🔥 LINHA
                    .setTextAlignment(TextAlignment.CENTER));
        }

        DecimalFormat df = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(new Locale("pt", "BR")));

        int i = 1;
        for (OrcamentoItemDTO item : o.getItens()) {

            t.addCell(cellTabela(String.valueOf(i++), font));
            t.addCell(cellTabela(item.getItemNome() + " - " + item.getDescricao(), font));
            
            // Valor unitário original (sem desconto)
            t.addCell(cellTabela("R$ " + df.format(item.getValorUnitarioOriginal()), font));
            
            t.addCell(cellTabela(String.valueOf(item.getQuantidade()), font));
            
            // Coluna de desconto do item
            Float descontoItem = null;
            if (item.getValorComDesconto() != null && !item.getValorUnitarioOriginal().equals(item.getValorComDesconto())) {
                descontoItem = item.getValorUnitarioOriginal() - item.getValorComDesconto();
            }
            String descontoTexto = (descontoItem != null && descontoItem > 0) ? 
                "R$ " + df.format(descontoItem) : "-";
            t.addCell(cellTabela(descontoTexto, font));
            
            t.addCell(cellTabela("R$ " + df.format(item.getValorTotal()), font));
        }

        c.add(t);
    }

    // ================= DESCRIÇÃO + PAGAMENTO =================
    private void adicionarDescricaoPagamento(Div c, OrcamentoCompletoDTO o,
                                             PdfFont bold, PdfFont font) {

        Table t = new Table(new float[]{2, 1}).useAllAvailableWidth();


        t.addCell(new Cell()
                .add(new Paragraph("DESCRIÇÃO").setFont(bold).setFontColor(PRIMARY_COLOR).setFontSize(9))
                .add(new Paragraph(o.getDescricao()).setFont(font).setFontSize(7))
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f)));

        t.addCell(new Cell()
                .add(new Paragraph("PAGAMENTO").setFont(bold).setFontColor(PRIMARY_COLOR).setFontSize(9))
                .add(new Paragraph(o.getTipoPagamento()).setFont(font).setFontSize(7))
                .setBackgroundColor(LIGHT_GRAY)
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f)));

        c.add(t);
    }

    // ================= RESUMO =================
    private void adicionarResumo(Div c, OrcamentoCompletoDTO o,
                                 PdfFont bold, PdfFont font) {

        DecimalFormat df = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(new Locale("pt", "BR")));

        c.add(new Paragraph("RESUMO FINANCEIRO")
                .setFont(bold).setFontColor(PRIMARY_COLOR).setFontSize(9));

        // Calcular totais
        // Total bruto (soma dos valores originais sem nenhum desconto)
        Float totalBruto = 0f;
        Float totalDescontosItens = 0f;
        
        if (o.getItens() != null) {
            for (OrcamentoItemDTO item : o.getItens()) {
                // Total bruto = quantidade * valor unitário original
                totalBruto += item.getQuantidade() * item.getValorUnitarioOriginal();
                
                // Calcular desconto do item se houver
                if (item.getValorComDesconto() != null && !item.getValorUnitarioOriginal().equals(item.getValorComDesconto())) {
                    Float descontoItem = item.getValorUnitarioOriginal() - item.getValorComDesconto();
                    totalDescontosItens += descontoItem * item.getQuantidade();
                }
            }
        }
        
        Float descontoAplicado = o.getDesconto() != null ? o.getDesconto() : 0f;
        Float descontoTotal = totalDescontosItens + descontoAplicado;

        Table t = new Table(2).useAllAvailableWidth();

        // Linha 1: Total Bruto
        t.addCell(new Cell()
                .add(new Paragraph("Total Itens (bruto):").setFont(font).setFontSize(9))
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(5));
        t.addCell(new Cell()
                .add(new Paragraph("R$ " + df.format(totalBruto)).setFont(bold).setFontSize(9))
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(5)
                .setTextAlignment(TextAlignment.RIGHT));

        // Seção de Descontos
        t.addCell(new Cell()
                .add(new Paragraph("Desconto Itens:").setFont(font).setFontSize(9))
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(5));
        t.addCell(new Cell()
                .add(new Paragraph("R$ " + df.format(totalDescontosItens)).setFont(font).setFontSize(9))
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(5)
                .setTextAlignment(TextAlignment.RIGHT));

        t.addCell(new Cell()
                .add(new Paragraph("Desconto Aplicado:").setFont(font).setFontSize(9))
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(5));
        t.addCell(new Cell()
                .add(new Paragraph("R$ " + df.format(descontoAplicado)).setFont(font).setFontSize(9))
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(5)
                .setTextAlignment(TextAlignment.RIGHT));

        // Desconto Total (destaque)
        t.addCell(new Cell()
                .add(new Paragraph("Desconto Total:").setFont(bold).setFontSize(10).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(PRIMARY_COLOR)
                .setBorder(Border.NO_BORDER)
                .setPadding(5));
        t.addCell(new Cell()
                .add(new Paragraph("R$ " + df.format(descontoTotal)).setFont(bold).setFontSize(11).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(PRIMARY_COLOR)
                .setBorder(Border.NO_BORDER)
                .setPadding(5)
                .setTextAlignment(TextAlignment.RIGHT));

        // Linha final: VALOR FINAL (destaque máximo)
        t.addCell(new Cell()
                .add(new Paragraph("VALOR FINAL:").setFont(bold).setFontSize(10).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(DARK_COLOR)
                .setBorder(Border.NO_BORDER)
                .setPadding(5));
        t.addCell(new Cell()
                .add(new Paragraph("R$ " + df.format(o.getValorFinal())).setFont(bold).setFontSize(12).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(DARK_COLOR)
                .setBorder(Border.NO_BORDER)
                .setPadding(5)
                .setTextAlignment(TextAlignment.RIGHT));

        c.add(t);
    }

    // ================= HELPERS =================
    private Cell box(String label, String valor,
                     PdfFont fontLabel, PdfFont fontValor,
                     Color cor, boolean big) {

        return new Cell().add(new Paragraph()
                        .add(new Text(label + " ").setFont(fontLabel).setFontSize(8))
                        .add(new Text(valor).setFont(fontValor).setFontSize(big ? 12 : 9)))
                .setBackgroundColor(cor)
                .setFontColor(ColorConstants.WHITE)
                .setBorder(Border.NO_BORDER)
                .setPadding(5);
    }

    private Cell cellTexto(String txt, PdfFont font) {
        return new Cell().add(new Paragraph(txt).setFont(font).setFontSize(8))
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(4);
    }

    private Cell cellTabela(String txt, PdfFont font) {
        return new Cell().add(new Paragraph(txt).setFont(font).setFontSize(7))
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f)) // 🔥 GRID
                .setPadding(3);
    }

    // ================= IMAGENS =================
    private void adicionarImagens(Div c, OrcamentoCompletoDTO o,
                                  PdfFont bold, PdfFont font) {
        
        if (o.getImagens() == null || o.getImagens().isEmpty()) {
            return;
        }

        c.add(new Paragraph("IMAGENS ANEXADAS")
                .setFont(bold).setFontColor(PRIMARY_COLOR)
                .setFontSize(9)
                .setMarginTop(10));

        // Criar tabela para as imagens (3 colunas)
        int numColunas = 3;
        Table t = new Table(numColunas).useAllAvailableWidth();

        try {
            for (OrcamentoImagemDTO imagem : o.getImagens()) {
                try {
                    // Carregar imagem usando FileUploadService
                    byte[] imagemBytes = fileUploadService.carregarArquivo(imagem.getUrlImagem());
                    if (imagemBytes != null && imagemBytes.length > 0) {
                        Image pdfImage = new Image(ImageDataFactory.create(imagemBytes))
                                .scaleToFit(150, 150);
                        
                        Cell cell = new Cell()
                                .add(pdfImage)
                                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                                .setPadding(5)
                                .setTextAlignment(TextAlignment.CENTER);
                        
                        t.addCell(cell);
                    }
                } catch (Exception e) {
                    System.err.println("Erro ao carregar imagem " + imagem.getNomeArquivo() + ": " + e.getMessage());
                    // Se não conseguir carregar a imagem, adiciona célula com nome
                    t.addCell(new Cell()
                            .add(new Paragraph("Imagem: " + imagem.getNomeArquivo())
                                    .setFont(font).setFontSize(6))
                            .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                            .setPadding(5));
                }
            }
        } catch (Exception e) {
            c.add(new Paragraph("Erro ao carregar imagens: " + e.getMessage())
                    .setFont(font).setFontSize(8).setFontColor(ColorConstants.RED));
        }

        c.add(t);
    }
}