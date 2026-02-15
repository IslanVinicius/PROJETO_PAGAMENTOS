package org.example.pagamentos.service;

import org.example.pagamentos.repository.SolicitacaoAprovacaoRepository;
import org.springframework.stereotype.Service;

@Service
public class SolicitacaoAprovacaoService {

    private final SolicitacaoAprovacaoRepository solicitacaoAprovacaoRepository;

    public SolicitacaoAprovacaoService(SolicitacaoAprovacaoRepository solicitacaoAprovacaoRepository) {
        this.solicitacaoAprovacaoRepository = solicitacaoAprovacaoRepository;
    }



}
