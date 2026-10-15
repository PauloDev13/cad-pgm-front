import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserAvatarService {
  // SVG padrão codificado em data URI para dispensar requisições extras
  readonly defaultFallbackAvatar =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9CA3AF">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    `);

  /**
   * Gera o hash SHA-256 formatado em hexadecimal a partir de uma string.
   */
  async computeSha256(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(value.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Constrói a URL do Gravatar com parâmetros de dimensão e fallback nativo.
   * @param email E-mail do usuário
   * @param size Dimensão em pixels (ex: 80)
   * @param defaultImage Fallback do Gravatar ('mp' = mystery person, 'identicon', etc.)
   */
  async getGravatarUrl(
    email: string | null | undefined,
    size = 80,
    defaultImage: 'mp' | 'identicon' | 'retro' = 'mp'
  ): Promise<string> {
    if (!email || !email.includes('@')) {
      return this.defaultFallbackAvatar;
    }

    try {
      const hash = await this.computeSha256(email);
      return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
    } catch {
      return this.defaultFallbackAvatar;
    }
  }

}
