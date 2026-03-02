import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BirthdayMessageTemplate } from '../entities/birthday-message-template.entity';
import { CreateBirthdayTemplateDto } from './dto/create-birthday-template.dto';

const safeTrim = (value?: string | null) => value?.trim() || null;

const extractAllowedVariables = (text: string) =>
  Array.from(new Set((text.match(/\{[a-zA-Z0-9_]+\}/g) || []).map((token) => token.trim()))).sort();

const mapTemplate = (template: BirthdayMessageTemplate) => ({
  id: template.id,
  name: template.name,
  channel: template.channel,
  title: template.title || null,
  body: template.body,
  allowed_variables: extractAllowedVariables(
    `${template.title || ''} ${template.body || ''}`.trim()
  ),
  is_active: Boolean(template.isActive),
  created_at: template.createdAt?.toISOString?.() || null,
  updated_at: template.updatedAt?.toISOString?.() || null
});

@Injectable()
export class BirthdayTemplatesService implements OnModuleInit {
  constructor(
    @InjectRepository(BirthdayMessageTemplate)
    private readonly templatesRepository: Repository<BirthdayMessageTemplate>
  ) {}

  async onModuleInit() {
    await this.ensureDefaultTemplates();
  }

  async list() {
    const templates = await this.templatesRepository.find({
      order: { createdAt: 'ASC', id: 'ASC' }
    });

    return templates.map(mapTemplate);
  }

  async create(data: CreateBirthdayTemplateDto) {
    const name = safeTrim(data.name);
    const channel = safeTrim(data.channel);
    const title = safeTrim(data.title);
    const body = safeTrim(data.body);

    if (!name || !channel || !body) {
      throw new HttpException(
        'Os campos nome, canal e mensagem são obrigatórios.',
        HttpStatus.BAD_REQUEST
      );
    }

    const existing = await this.templatesRepository.findOne({
      where: { name }
    });
    if (existing) {
      throw new HttpException('Já existe um template com este nome.', HttpStatus.BAD_REQUEST);
    }

    const saved = await this.templatesRepository.save(
      this.templatesRepository.create({
        name,
        channel,
        title,
        body,
        isActive: data.is_active ?? true
      })
    );

    return mapTemplate(saved);
  }

  private async ensureDefaultTemplates() {
    const count = await this.templatesRepository.count();
    if (count > 0) return;

    const defaults = [
      this.templatesRepository.create({
        name: 'Parabéns Padrão',
        channel: 'Push',
        title: 'Feliz aniversário!',
        body: 'Querido(a) {primeiro_nome}, a IPIGG deseja um feliz aniversário! Que Deus abençoe seus {idade} anos com saúde e alegria.',
        isActive: true
      }),
      this.templatesRepository.create({
        name: 'Aniversário com Versículo',
        channel: 'Email',
        title: 'Hoje é um dia especial, {primeiro_nome}!',
        body: 'Parabéns, {primeiro_nome}! Que o Senhor te fortaleça neste novo ciclo. "Este é o dia que o Senhor fez; regozijemo-nos e alegremo-nos nele." (Salmos 118:24)',
        isActive: true
      })
    ];

    await this.templatesRepository.save(defaults);
  }
}
