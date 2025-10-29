import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interface para a resposta da API ViaCEP (pode ir para um arquivo de models se preferir)
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // Cidade
  uf: string;         // Estado
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;    // Indica erro no ViaCEP (CEP não encontrado)
}

@Injectable({
  providedIn: 'root',
})
export class CepService {
  private http = inject(HttpClient);
  private viaCepUrl = 'https://viacep.com.br/ws';

  /**
   * Busca informações de endereço a partir de um CEP na API ViaCEP.
   * @param cep String do CEP (com ou sem máscara).
   * @returns Observable com os dados do endereço ou null se não encontrado/erro.
   */
  fetchAddressFromCep(cep: string): Observable<ViaCepResponse | null> {
    const cleanCep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (cleanCep.length !== 8) {
      console.warn('[CepService] CEP inválido (formato):', cep);
      return of(null); // Retorna nulo se o formato básico for inválido
    }

    const url = `${this.viaCepUrl}/${cleanCep}/json/`;
    console.log(`[CepService] Buscando CEP: ${url}`);

    return this.http.get<ViaCepResponse>(url).pipe(
      catchError((error) => {
        console.error('[CepService] Erro na requisição ViaCEP:', error);
        return of(null); // Retorna nulo em caso de erro HTTP
      }),
      map(response => {
        // Verifica se a API retornou um erro interno (CEP não encontrado)
        if (response && response.erro) {
          console.warn('[CepService] CEP não encontrado pela API ViaCEP:', cep);
          return null;
        }
        return response; // Retorna a resposta válida ou null se erro HTTP
      })
    );
  }
}