/**
 * Centralização de todos os serviços
 * Uso: import { api, authService, empresaService } from '@/services';
 */

export { api, apiRequest } from './api';
export { login as authService } from './authService';
export { empresaService };
export { prestadorService };
export { dadosBancariosService };
export { orcamentoService };
export { solicitacaoAprovacaoService };
export { userService };
export { grupoItemService };
export { itemService };

// Importações dos services
import { empresaService } from './empresaService';
import { prestadorService } from './prestadorService';
import { dadosBancariosService } from './dadosBancariosService';
import { orcamentoService } from './orcamentoService';
import { solicitacaoAprovacaoService } from './solicitacaoAprovacaoService';
import { userService } from './userService';
import { grupoItemService } from './grupoItemService';
import { itemService } from './itemService';
