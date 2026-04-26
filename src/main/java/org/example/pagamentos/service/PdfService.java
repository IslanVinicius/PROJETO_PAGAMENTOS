package org.example.pagamentos.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
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
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

@Service
public class PdfService {

    private static final Color PRIMARY_COLOR = new DeviceRgb(128, 20, 40);
    private static final Color DARK_COLOR = new DeviceRgb(40, 10, 15);
    private static final Color LIGHT_GRAY = new DeviceRgb(245, 245, 245);
    private static final Color BORDER_COLOR = new DeviceRgb(200, 200, 200);

    public byte[] gerarOrcamentoPdf(OrcamentoCompletoDTO orcamento) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);

        document.setMargins(15, 15, 15, 15);

        PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        Table mainContainer = new Table(UnitValue.createPercentArray(1))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(new SolidBorder(BORDER_COLOR, 1))
                .setPadding(10);

        Cell containerCell = new Cell().setBorder(Border.NO_BORDER).setPadding(0);
        Div content = new Div();

        adicionarCabecalho(content, orcamento, fontBold, font);
        adicionarPrestadorBanco(content, orcamento, fontBold, font);
        adicionarEmpresa(content, orcamento, fontBold, font);
        adicionarItens(content, orcamento, fontBold, font);
        adicionarDescricaoEPagamento(content, orcamento, fontBold, font);
        adicionarResumo(content, orcamento, fontBold, font);

        containerCell.add(content);
        mainContainer.addCell(containerCell);
        document.add(mainContainer);

        document.close();
        return baos.toByteArray();
    }

    private void adicionarCabecalho(Div container, OrcamentoCompletoDTO o,
                                    PdfFont bold, PdfFont font) {

        Table t = new Table(new float[]{0.7f, 2, 1}).useAllAvailableWidth();
        t.setMarginBottom(4);

        try {
            Image logo = new Image(ImageDataFactory.create(
                    new ClassPathResource("images/logo.png").getURL()))
                    .scaleToFit(50, 25);
            t.addCell(new Cell().add(logo).setBorder(Border.NO_BORDER).setPadding(0));
        } catch (Exception e) {
            t.addCell(new Cell().add(new Paragraph("LOGO")).setBorder(Border.NO_BORDER));
        }

        Paragraph empresa = new Paragraph()
                .add(new Text(o.getRazaoEmpresa()).setFont(bold).setFontSize(11))
                .add(new Text(" | CNPJ: " + o.getCnpjEmpresa()).setFont(font).setFontSize(8))
                .setMargin(0);

        t.addCell(new Cell().add(empresa).setBorder(Border.NO_BORDER).setPadding(0));

        String data = o.getMovimento() != null ?
                o.getMovimento().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";

        Paragraph direita = new Paragraph()
                .add(new Text("Nº " + o.getOrcamentoID()).setFont(bold).setFontSize(9))
                .add(new Text(" | " + data).setFont(font).setFontSize(8))
                .setTextAlignment(TextAlignment.RIGHT)
                .setMargin(0);

        t.addCell(new Cell().add(direita).setBorder(Border.NO_BORDER).setPadding(0));

        container.add(t);
        container.add(new LineSeparator(new SolidLine(0.5f)).setMarginBottom(5));
    }

    private void adicionarPrestadorBanco(Div container, OrcamentoCompletoDTO o,
                                         PdfFont bold, PdfFont font) {

        Table t = new Table(2).useAllAvailableWidth().setMarginBottom(5);

        String prestador = "PRESTADOR: " + o.getNomePrestador() +
                " | CPF: " + o.getCpfPrestador();

        t.addCell(cellTexto(prestador, bold, font));

        var b = o.getDadosBancarios();

        String banco = b != null ?
                "BANCO: " + b.getBanco() +
                " | Ag: " + b.getAgencia() +
                " | CC: " + b.getConta() +
                " | PIX: " + b.getChavePix()
                : "Dados bancários não informados";

        t.addCell(cellTexto(banco, bold, font));

        container.add(t);
    }

    private void adicionarEmpresa(Div container, OrcamentoCompletoDTO o,
                                  PdfFont bold, PdfFont font) {

        Table t = new Table(1).useAllAvailableWidth().setMarginBottom(5);

        String endereco = o.getEnderecoEmpresa() != null ?
                o.getEnderecoEmpresa().getLogradouro() + ", " +
                        o.getEnderecoEmpresa().getCidade()
                : "Endereço não informado";

        String linha = "EMPRESA: " + o.getRazaoEmpresa() +
                " | CNPJ: " + o.getCnpjEmpresa() +
                " | " + endereco;

        t.addCell(cellTexto(linha, bold, font));
        container.add(t);
    }

    private void adicionarItens(Div container, OrcamentoCompletoDTO o,
                                PdfFont bold, PdfFont font) {

        container.add(new Paragraph("ITENS DO ORÇAMENTO")
                .setFont(bold).setFontSize(9).setFontColor(PRIMARY_COLOR));

        Table t = new Table(new float[]{8, 42, 15, 12, 23})
                .useAllAvailableWidth()
                .setMarginBottom(5);

        String[] headers = {"#", "DESCRIÇÃO", "VALOR", "QTD", "TOTAL"};

        for (String h : headers) {
            t.addHeaderCell(new Cell()
                    .add(new Paragraph(h).setFont(bold).setFontSize(7).setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(PRIMARY_COLOR)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(3)
                    .setBorder(Border.NO_BORDER));
        }

        DecimalFormat df = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(new Locale("pt", "BR")));

        int i = 1;
        for (OrcamentoItemDTO item : o.getItens()) {

            t.addCell(cellTabela(String.valueOf(i++), font));
            t.addCell(cellTabela(item.getItemNome() + " - " + item.getDescricao(), font));
            t.addCell(cellTabela("R$ " + df.format(item.getValorUnitario()), font));
            t.addCell(cellTabela(String.valueOf(item.getQuantidade()), font));
            t.addCell(cellTabela("R$ " + df.format(item.getValorTotal()), font));
        }

        container.add(t);
    }

    private void adicionarDescricaoEPagamento(Div container, OrcamentoCompletoDTO o,
                                              PdfFont bold, PdfFont font) {

        Table t = new Table(new float[]{2, 1}).useAllAvailableWidth().setMarginBottom(5);

        Cell desc = new Cell().setPadding(4)
                .add(new Paragraph("DESCRIÇÃO").setFont(bold).setFontSize(9).setFontColor(PRIMARY_COLOR))
                .add(new Paragraph(o.getDescricao()).setFont(font).setFontSize(7));

        Cell pag = new Cell().setPadding(4)
                .setBackgroundColor(LIGHT_GRAY)
                .add(new Paragraph("PAGAMENTO").setFont(bold).setFontSize(9).setFontColor(PRIMARY_COLOR))
                .add(new Paragraph(o.getTipoPagamento()).setFont(font).setFontSize(8));

        t.addCell(desc);
        t.addCell(pag);

        container.add(t);
    }

    private void adicionarResumo(Div container, OrcamentoCompletoDTO o,
                                 PdfFont bold, PdfFont font) {

        DecimalFormat df = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(new Locale("pt", "BR")));

        container.add(new Paragraph("RESUMO FINANCEIRO")
                .setFont(bold).setFontSize(9).setFontColor(PRIMARY_COLOR));

        Table t = new Table(2).useAllAvailableWidth();

        t.addCell(box("Total Itens:", "R$ " + df.format(o.getValorTotalItens()), bold, font, PRIMARY_COLOR));
        t.addCell(box("Desconto:", "R$ " + df.format(o.getDesconto()), font, font, LIGHT_GRAY));
        t.addCell(box("VALOR FINAL:", "R$ " + df.format(o.getValorFinal()), bold, bold, DARK_COLOR, true));

        container.add(t);
    }

    private Cell box(String label, String valor, PdfFont fontLabel, PdfFont fontValor, Color cor) {
        return box(label, valor, fontLabel, fontValor, cor, false);
    }

    private Cell box(String label, String valor, PdfFont fontLabel, PdfFont fontValor, Color cor, boolean destaque) {

        Paragraph p = new Paragraph()
                .add(new Text(label + " ").setFont(fontLabel).setFontSize(8))
                .add(new Text(valor).setFont(fontValor).setFontSize(destaque ? 12 : 9));

        return new Cell().add(p)
                .setBackgroundColor(cor)
                .setFontColor(ColorConstants.WHITE)
                .setPadding(4)
                .setBorder(Border.NO_BORDER);
    }

    private Cell cellTexto(String texto, PdfFont bold, PdfFont font) {
        return new Cell().add(new Paragraph(texto).setFont(font).setFontSize(8))
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(4);
    }

    private Cell cellTabela(String texto, PdfFont font) {
        return new Cell().add(new Paragraph(texto).setFont(font).setFontSize(7).setMargin(0))
                .setPadding(3)
                .setBorder(Border.NO_BORDER);
    }
}