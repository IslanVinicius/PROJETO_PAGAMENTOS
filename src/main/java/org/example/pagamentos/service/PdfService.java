package org.example.pagamentos.service;

import com.itextpdf.io.font.constants
        .StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.example.pagamentos.DTO.OrcamentoCompletoDTO;
import org.example.pagamentos.DTO.OrcamentoItemDTO;
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
    private static final Color TEXT_COLOR = new DeviceRgb(0, 0, 0);
    private static final Color BORDER_COLOR = new DeviceRgb(200, 200, 200);

    public byte[] gerarOrcamentoPdf(OrcamentoCompletoDTO orcamento) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(30, 35, 30, 35);

        PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        adicionarCabecalho(document, orcamento, fontBold, font);
        adicionarTitulo(document, fontBold);
        adicionarSecaoPrestadorData(document, orcamento, fontBold, font);
        adicionarSecaoSolicitante(document, orcamento, fontBold, font);
        adicionarDescricaoServico(document, orcamento, fontBold, font);
        adicionarTabelaItens(document, orcamento, fontBold, font);
        adicionarResumoFinanceiro(document, orcamento, fontBold, font);
        adicionarPagamentoObservacoes(document, orcamento, fontBold, font);
        adicionarRodape(document, font);

        document.close();
        return baos.toByteArray();
    }

    private void adicionarCabecalho(Document document, OrcamentoCompletoDTO orcamento, 
                                   PdfFont fontBold, PdfFont font) {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 2, 1}));
        headerTable.setWidth(UnitValue.createPercentValue(100));
        headerTable.setBorder(Border.NO_BORDER);
        
        // Adicionar logo da empresa
        try {
            ClassPathResource resource = new ClassPathResource("images/logo.png");
            ImageData imageData = ImageDataFactory.create(resource.getURL());
            Image logo = new Image(imageData);
            
            // Ajustar tamanho da logo (ajuste conforme necessário)
            logo.scaleToFit(80, 40); // largura máxima 80px, altura máxima 40px
            
            headerTable.addCell(new Cell().add(logo).setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE));
        } catch (Exception e) {
            // Se não conseguir carregar a logo, usa texto como fallback
            Paragraph logoText = new Paragraph();
            logoText.add(new Text("+ Permanente").setFont(fontBold).setFontSize(20).setFontColor(PRIMARY_COLOR));
            headerTable.addCell(new Cell().add(logoText).setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE));
        }
        
        Paragraph empresaInfo = new Paragraph();
        empresaInfo.add(new Text(orcamento.getNomeEmpresa() != null ? orcamento.getNomeEmpresa() : "Permanente").setFont(fontBold).setFontSize(14));
        empresaInfo.add(new Text("\nCPF/CNPJ: " + (orcamento.getCnpjEmpresa() != null ? orcamento.getCnpjEmpresa() : "12.345.6864-90")).setFont(font).setFontSize(10));
        headerTable.addCell(new Cell().add(empresaInfo).setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE));
        
        Paragraph paginaInfo = new Paragraph();
        paginaInfo.add(new Text("Página 1 de 1\nNúmero: " + orcamento.getOrcamentoID()).setFont(font).setFontSize(9));
        paginaInfo.setTextAlignment(TextAlignment.RIGHT);
        headerTable.addCell(new Cell().add(paginaInfo).setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.TOP));
        
        document.add(headerTable);
        
        LineSeparator line = new LineSeparator(new SolidLine(0.5f));
        line.setMarginTop(5);
        line.setMarginBottom(10);
        document.add(line);
    }

    private void adicionarTitulo(Document document, PdfFont fontBold) {
        Paragraph titulo = new Paragraph();
        titulo.add(new Text("Orçamento").setFont(fontBold).setFontSize(18).setFontColor(PRIMARY_COLOR));
        titulo.setTextAlignment(TextAlignment.CENTER);
        titulo.setMarginTop(5);
        titulo.setMarginBottom(15);
        document.add(titulo);
    }

    private void adicionarSecaoPrestadorData(Document document, OrcamentoCompletoDTO orcamento,
                                           PdfFont fontBold, PdfFont font) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(10);

        Paragraph prestadorSection = new Paragraph();
        prestadorSection.add(new Text("Prestador: ").setFont(fontBold).setFontSize(10));
        prestadorSection.add(new Text(orcamento.getNomePrestador() != null ? orcamento.getNomePrestador() : "Permanente").setFont(font).setFontSize(10));
        prestadorSection.add(new Text("\nCPF/CNPJ: " + (orcamento.getCpfPrestador() != null ? orcamento.getCpfPrestador() : "12.345.678/0001-")).setFont(font).setFontSize(10));
        
        table.addCell(new Cell().add(prestadorSection).setBorder(Border.NO_BORDER).setPaddingBottom(5));
        
        Paragraph dataSection = new Paragraph();
        dataSection.add(new Text("Data: ").setFont(fontBold).setFontSize(10));
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String dataFormatada = orcamento.getMovimento() != null ? orcamento.getMovimento().format(formatter) : "24/04/2024";
        dataSection.add(new Text(dataFormatada).setFont(font).setFontSize(10));
        dataSection.setTextAlignment(TextAlignment.RIGHT);
        
        table.addCell(new Cell().add(dataSection).setBorder(Border.NO_BORDER).setPaddingBottom(5));
        
        document.add(table);
    }

    private void adicionarSecaoSolicitante(Document document, OrcamentoCompletoDTO orcamento,
                                         PdfFont fontBold, PdfFont font) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(10);
        
        Paragraph solicitanteSection = new Paragraph();
        solicitanteSection.add(new Text("Solicitante: ").setFont(fontBold).setFontSize(9));
        solicitanteSection.add(new Text(orcamento.getNomeSolicitante() != null ? orcamento.getNomeSolicitante() : "João Pereira").setFont(font).setFontSize(9));
        solicitanteSection.add(new Text("\nEndereço: Avenida Governador Adolfo Konder 865").setFont(font).setFontSize(9));
        
        String cidade = "São José - SC";
        if (orcamento.getEnderecoEmpresa() != null) {
            cidade = orcamento.getEnderecoEmpresa().getCidade() + " - " + orcamento.getEnderecoEmpresa().getEstado();
        }
        solicitanteSection.add(new Text("\nCidade: " + cidade).setFont(font).setFontSize(9));
        solicitanteSection.add(new Text("\nCPF: 825.166.930-000-001").setFont(font).setFontSize(9));
        
        table.addCell(new Cell().add(solicitanteSection).setBorder(Border.NO_BORDER).setPaddingBottom(3));
        
        Paragraph infoSection = new Paragraph();
        infoSection.add(new Text("Cidade: " + cidade).setFont(fontBold).setFontSize(9));
        infoSection.add(new Text("\nTelefone: (48) 3254-7890").setFont(font).setFontSize(9));
        infoSection.add(new Text("\nE-mail: " + (orcamento.getUsernameSolicitante() != null ? orcamento.getUsernameSolicitante() : "joao_pereira")).setFont(font).setFontSize(9));
        infoSection.add(new Text("\nCPF: 825.166.930-00-000").setFont(font).setFontSize(9));
        
        table.addCell(new Cell().add(infoSection).setBorder(Border.NO_BORDER).setPaddingBottom(3));
        
        document.add(table);
        
        LineSeparator line = new LineSeparator(new SolidLine(0.3f));
        line.setMarginTop(5);
        line.setMarginBottom(8);
        document.add(line);
    }

    private void adicionarDescricaoServico(Document document, OrcamentoCompletoDTO orcamento,
                                          PdfFont fontBold, PdfFont font) {
        Paragraph descricaoLabel = new Paragraph();
        descricaoLabel.add(new Text("Descrição do Serviço:").setFont(fontBold).setFontSize(9));
        descricaoLabel.setMarginBottom(3);
        document.add(descricaoLabel);
        
        LineSeparator line = new LineSeparator(new SolidLine(0.3f));
        line.setMarginBottom(8);
        document.add(line);
    }

    private void adicionarTabelaItens(Document document, OrcamentoCompletoDTO orcamento,
                                     PdfFont fontBold, PdfFont font) {
        float[] columnWidths = {15, 35, 15, 15, 20};
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(10);
        
        String[] headers = {"GRUPO DO ITEM", "DESCRIÇÃO DO ITEM", "PREÇO DO ITEM (R$)", "QUANTIDADE", "VALOR TOTAL (R$)"};
        
        for (String header : headers) {
            Paragraph headerParagraph = new Paragraph();
            headerParagraph.add(new Text(header).setFont(fontBold).setFontSize(8).setFontColor(ColorConstants.WHITE));
            Cell cell = new Cell().add(headerParagraph);
            cell.setBackgroundColor(PRIMARY_COLOR);
            cell.setTextAlignment(TextAlignment.CENTER);
            cell.setPadding(4);
            cell.setBorder(new SolidBorder(ColorConstants.WHITE, 0.5f));
            table.addHeaderCell(cell);
        }
        
        DecimalFormat df = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(new Locale("pt", "BR")));
        
        if (orcamento.getItens() != null && !orcamento.getItens().isEmpty()) {
            boolean alternate = false;
            for (OrcamentoItemDTO item : orcamento.getItens()) {
                Color backgroundColor = alternate ? LIGHT_GRAY : ColorConstants.WHITE;
                
                table.addCell(criarCelulaTabela("MATERIAIS", font, 8, backgroundColor, TextAlignment.CENTER, 4));
                table.addCell(criarCelulaTabela(item.getItemNome(), font, 8, backgroundColor, TextAlignment.LEFT, 4));
                table.addCell(criarCelulaTabela("R$ " + df.format(item.getValorUnitario()), font, 8, backgroundColor, TextAlignment.CENTER, 4));
                table.addCell(criarCelulaTabela(String.valueOf(item.getQuantidade()), font, 8, backgroundColor, TextAlignment.CENTER, 4));
                table.addCell(criarCelulaTabela("R$ " + df.format(item.getValorTotal()), font, 8, backgroundColor, TextAlignment.CENTER, 4));
                
                alternate = !alternate;
            }
        }
        
        document.add(table);
    }

    private Cell criarCelulaTabela(String texto, PdfFont font, int fontSize, Color backgroundColor, 
                                  TextAlignment alignment, int padding) {
        Paragraph paragraph = new Paragraph();
        paragraph.add(new Text(texto).setFont(font).setFontSize(fontSize));
        Cell cell = new Cell().add(paragraph);
        cell.setBackgroundColor(backgroundColor);
        cell.setTextAlignment(alignment);
        cell.setPadding(padding);
        cell.setBorder(new SolidBorder(BORDER_COLOR, 0.3f));
        return cell;
    }

    private void adicionarResumoFinanceiro(Document document, OrcamentoCompletoDTO orcamento,
                                          PdfFont fontBold, PdfFont font) {
        DecimalFormat df = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(new Locale("pt", "BR")));
        
        Table mainTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        mainTable.setWidth(UnitValue.createPercentValue(100));
        mainTable.setMarginBottom(10);
        
        Paragraph resumoLabel = new Paragraph();
        resumoLabel.add(new Text("Resumo Financeiro:").setFont(fontBold).setFontSize(9));
        resumoLabel.setMarginBottom(5);
        
        Paragraph totalItensLabel = new Paragraph();
        totalItensLabel.add(new Text("Valor Total dos Itens:").setFont(font).setFontSize(9));
        
        Paragraph totalItensValor = new Paragraph();
        totalItensValor.add(new Text("R$ " + df.format(orcamento.getValorTotalItens() != null ? orcamento.getValorTotalItens() : 0)).setFont(font).setFontSize(9));
        totalItensValor.setTextAlignment(TextAlignment.RIGHT);
        
        Paragraph totalOrcamentoLabel = new Paragraph();
        totalOrcamentoLabel.add(new Text("Valor Total do Orçamento:").setFont(fontBold).setFontSize(9));
        
        Paragraph totalOrcamentoValor = new Paragraph();
        totalOrcamentoValor.add(new Text("R$ " + df.format(orcamento.getValorFinal() != null ? orcamento.getValorFinal() : 0)).setFont(fontBold).setFontSize(10));
        totalOrcamentoValor.setTextAlignment(TextAlignment.RIGHT);
        
        Cell leftCell = new Cell()
            .add(resumoLabel)
            .add(totalItensLabel)
            .add(totalItensValor)
            .add(totalOrcamentoLabel)
            .add(totalOrcamentoValor);
        leftCell.setBorder(Border.NO_BORDER);
        mainTable.addCell(leftCell);
        
        Table boxesTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        boxesTable.setWidth(UnitValue.createPercentValue(100));
        
        Paragraph box1Label = new Paragraph();
        box1Label.add(new Text("Valor Total dos Itens:").setFont(font).setFontSize(9).setFontColor(ColorConstants.WHITE));
        Cell box1LabelCell = new Cell().add(box1Label);
        box1LabelCell.setBackgroundColor(PRIMARY_COLOR);
        box1LabelCell.setTextAlignment(TextAlignment.LEFT);
        box1LabelCell.setPadding(5);
        
        Paragraph box1Valor = new Paragraph();
        box1Valor.add(new Text("R$ " + df.format(orcamento.getValorTotalItens() != null ? orcamento.getValorTotalItens() : 0)).setFont(fontBold).setFontSize(10).setFontColor(ColorConstants.WHITE));
        Cell box1ValorCell = new Cell().add(box1Valor);
        box1ValorCell.setBackgroundColor(PRIMARY_COLOR);
        box1ValorCell.setTextAlignment(TextAlignment.RIGHT);
        box1ValorCell.setPadding(5);
        
        boxesTable.addCell(box1LabelCell);
        boxesTable.addCell(box1ValorCell);
        
        Paragraph box2Label = new Paragraph();
        box2Label.add(new Text("Desconto:").setFont(font).setFontSize(9).setFontColor(TEXT_COLOR));
        Cell box2LabelCell = new Cell().add(box2Label);
        box2LabelCell.setBackgroundColor(LIGHT_GRAY);
        box2LabelCell.setTextAlignment(TextAlignment.LEFT);
        box2LabelCell.setPadding(5);
        
        Paragraph box2Valor = new Paragraph();
        box2Valor.add(new Text("R$ " + df.format(orcamento.getDesconto() != null ? orcamento.getDesconto() : 0)).setFont(font).setFontSize(9).setFontColor(TEXT_COLOR));
        Cell box2ValorCell = new Cell().add(box2Valor);
        box2ValorCell.setBackgroundColor(LIGHT_GRAY);
        box2ValorCell.setTextAlignment(TextAlignment.RIGHT);
        box2ValorCell.setPadding(5);
        
        boxesTable.addCell(box2LabelCell);
        boxesTable.addCell(box2ValorCell);
        
        Paragraph box3Label = new Paragraph();
        box3Label.add(new Text("Valor Total do Orçamento:").setFont(fontBold).setFontSize(9).setFontColor(ColorConstants.WHITE));
        Cell box3LabelCell = new Cell().add(box3Label);
        box3LabelCell.setBackgroundColor(DARK_COLOR);
        box3LabelCell.setTextAlignment(TextAlignment.LEFT);
        box3LabelCell.setPadding(5);
        
        Paragraph box3Valor = new Paragraph();
        box3Valor.add(new Text("R$ " + df.format(orcamento.getValorFinal() != null ? orcamento.getValorFinal() : 0)).setFont(fontBold).setFontSize(11).setFontColor(ColorConstants.WHITE));
        Cell box3ValorCell = new Cell().add(box3Valor);
        box3ValorCell.setBackgroundColor(DARK_COLOR);
        box3ValorCell.setTextAlignment(TextAlignment.RIGHT);
        box3ValorCell.setPadding(5);
        
        boxesTable.addCell(box3LabelCell);
        boxesTable.addCell(box3ValorCell);
        
        mainTable.addCell(new Cell().add(boxesTable).setBorder(Border.NO_BORDER));
        
        document.add(mainTable);
    }

    private void adicionarPagamentoObservacoes(Document document, OrcamentoCompletoDTO orcamento,
                                              PdfFont fontBold, PdfFont font) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(10);
        
        Paragraph formaPagamentoLabel = new Paragraph();
        formaPagamentoLabel.add(new Text("Forma de Pagamento:").setFont(fontBold).setFontSize(9));
        formaPagamentoLabel.setMarginBottom(3);
        
        Paragraph formaPagamentoValor = new Paragraph();
        formaPagamentoValor.add(new Text(orcamento.getTipoPagamento() != null ? orcamento.getTipoPagamento() : "").setFont(font).setFontSize(9));
        
        Cell formaPagamentoCell = new Cell().add(formaPagamentoLabel).add(formaPagamentoValor);
        formaPagamentoCell.setBorder(new SolidBorder(BORDER_COLOR, 0.5f));
        formaPagamentoCell.setPadding(5);
        formaPagamentoCell.setHeight(35);
        
        table.addCell(formaPagamentoCell);
        table.addCell(new Cell().setBorder(Border.NO_BORDER));
        
        Paragraph observacoesLabel = new Paragraph();
        observacoesLabel.add(new Text("Observações:").setFont(fontBold).setFontSize(9));
        observacoesLabel.setMarginTop(5);
        
        Cell observacoesCell = new Cell().add(observacoesLabel);
        observacoesCell.setBorder(Border.NO_BORDER);
        observacoesCell.setPaddingTop(5);
        
        table.addCell(observacoesCell);
        table.addCell(new Cell().setBorder(Border.NO_BORDER));
        
        document.add(table);
    }

    private void adicionarRodape(Document document, PdfFont font) {
        Paragraph assinaturaLinha = new Paragraph();
        assinaturaLinha.add(new Text("_________________________________________").setFont(font).setFontSize(9));
        assinaturaLinha.setTextAlignment(TextAlignment.CENTER);
        assinaturaLinha.setMarginTop(15);
        assinaturaLinha.setMarginBottom(2);
        document.add(assinaturaLinha);
        
        Paragraph assinaturaTexto = new Paragraph();
        assinaturaTexto.add(new Text("Responsável pelo Orçamento").setFont(font).setFontSize(8));
        assinaturaTexto.setTextAlignment(TextAlignment.CENTER);
        document.add(assinaturaTexto);
        
        Table assinaturaTable = new Table(1);
        assinaturaTable.setWidth(UnitValue.createPercentValue(40));
        assinaturaTable.setHorizontalAlignment(HorizontalAlignment.RIGHT);
        assinaturaTable.setMarginTop(5);
        
        Cell assinaturaCell = new Cell().setHeight(50).setBorder(new SolidBorder(BORDER_COLOR, 0.5f));
        assinaturaTable.addCell(assinaturaCell);
        
        document.add(assinaturaTable);
    }
}
