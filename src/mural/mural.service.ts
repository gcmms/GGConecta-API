import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuralItem } from '../entities/mural-item.entity';
import { CreateMuralDto } from './dto/create-mural.dto';
import { UpdateMuralDto } from './dto/update-mural.dto';

const mapItem = (item: MuralItem) => ({
  id: item.id,
  title: item.title,
  subtitle: item.subtitle,
  publish_date: item.publishDate,
  link: item.link ?? null,
  created_at: item.createdAt?.toISOString?.() ?? null,
  updated_at: item.updatedAt?.toISOString?.() ?? null
});

@Injectable()
export class MuralService {
  constructor(
    @InjectRepository(MuralItem)
    private readonly muralRepository: Repository<MuralItem>
  ) {}

  async list() {
    const items = await this.muralRepository.find({
      order: { publishDate: 'DESC' }
    });
    return items.map(mapItem);
  }

  async findById(id: number) {
    const item = await this.muralRepository.findOne({ where: { id } });
    return item ? mapItem(item) : null;
  }

  async create(data: CreateMuralDto) {
    const missingFields = ['title', 'subtitle', 'publish_date'].filter((field) => {
      const value = (data as Record<string, any>)[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missingFields.length > 0) {
      throw new HttpException(
        `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const created = this.muralRepository.create({
      title: data.title.trim(),
      subtitle: data.subtitle.trim(),
      publishDate: data.publish_date,
      link: data.link?.trim() || null
    });

    const saved = await this.muralRepository.save(created);
    return mapItem(saved);
  }

  async remove(id: number) {
    const result = await this.muralRepository.delete(id);
    return result.affected && result.affected > 0;
  }

  async update(id: number, data: UpdateMuralDto) {
    const existing = await this.muralRepository.findOne({ where: { id } });
    if (!existing) {
      return null;
    }

    if (data.title !== undefined) {
      const title = data.title.trim();
      if (!title) {
        throw new HttpException('Campo title inválido.', HttpStatus.BAD_REQUEST);
      }
      existing.title = title;
    }

    if (data.subtitle !== undefined) {
      const subtitle = data.subtitle.trim();
      if (!subtitle) {
        throw new HttpException('Campo subtitle inválido.', HttpStatus.BAD_REQUEST);
      }
      existing.subtitle = subtitle;
    }

    if (data.publish_date !== undefined) {
      const publishDate = String(data.publish_date).trim();
      if (!publishDate) {
        throw new HttpException('Campo publish_date inválido.', HttpStatus.BAD_REQUEST);
      }
      existing.publishDate = publishDate;
    }

    if (data.link !== undefined) {
      existing.link = data.link?.trim() || null;
    }

    const saved = await this.muralRepository.save(existing);
    return mapItem(saved);
  }
}
