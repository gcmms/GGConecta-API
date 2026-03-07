import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { InventoryLoan } from '../entities/inventory-loan.entity';
import { InventoryMaintenanceRequest } from '../entities/inventory-maintenance-request.entity';
import { Ministry } from '../entities/ministry.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { DisposeInventoryItemDto } from './dto/dispose-inventory-item.dto';
import { CreateInventoryLoanDto, ReturnInventoryLoanDto } from './dto/create-inventory-loan.dto';
import {
  CreateInventoryMaintenanceDto,
  UpdateInventoryMaintenanceDto
} from './dto/create-inventory-maintenance.dto';

const cleanText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const todayDdMmYy = () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
};

const normalizeReportDate = () => {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly itemsRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryLoan)
    private readonly loansRepository: Repository<InventoryLoan>,
    @InjectRepository(InventoryMaintenanceRequest)
    private readonly maintenanceRepository: Repository<InventoryMaintenanceRequest>,
    @InjectRepository(Ministry)
    private readonly ministriesRepository: Repository<Ministry>,
    private readonly configService: ConfigService
  ) {}

  async listItems() {
    const items = await this.itemsRepository.find({
      relations: { ministry: true },
      order: { createdAt: 'DESC' }
    });

    return items.map((item) => this.mapItem(item));
  }

  async findItemById(id: number) {
    const item = await this.loadItemOrFail(id);
    return this.mapItem(item);
  }

  async createItem(data: CreateInventoryItemDto) {
    const ministry = await this.loadMinistryOrFail(data.ministry_id);

    const patrimonyNumber = cleanText(data.patrimony_number)
      ? (cleanText(data.patrimony_number) as string)
      : await this.generatePatrimonyNumber(ministry.id);

    await this.assertPatrimonyAvailable(patrimonyNumber);

    const item = await this.itemsRepository.save(
      this.itemsRepository.create({
        ministryId: ministry.id,
        name: data.name.trim(),
        patrimonyNumber,
        storageLocation: data.storage_location.trim(),
        status: 'Disponivel',
        notes: cleanText(data.notes)
      })
    );

    const reloaded = await this.loadItemOrFail(item.id);
    return this.mapItem(reloaded);
  }

  async updateItem(id: number, data: UpdateInventoryItemDto) {
    const item = await this.loadItemOrFail(id);

    if (item.status === 'Baixado') {
      throw new HttpException(
        'Item já baixado não pode ser editado.',
        HttpStatus.BAD_REQUEST
      );
    }

    if (data.ministry_id !== undefined) {
      await this.loadMinistryOrFail(data.ministry_id);
      item.ministryId = data.ministry_id;
    }

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) {
        throw new HttpException('Nome do item é obrigatório.', HttpStatus.BAD_REQUEST);
      }
      item.name = name;
    }

    if (data.patrimony_number !== undefined) {
      const patrimonyNumber = cleanText(data.patrimony_number);
      if (!patrimonyNumber) {
        throw new HttpException(
          'Número de patrimônio não pode ser vazio.',
          HttpStatus.BAD_REQUEST
        );
      }
      if (patrimonyNumber !== item.patrimonyNumber) {
        await this.assertPatrimonyAvailable(patrimonyNumber, item.id);
      }
      item.patrimonyNumber = patrimonyNumber;
    }

    if (data.storage_location !== undefined) {
      const location = data.storage_location.trim();
      if (!location) {
        throw new HttpException('Local do item é obrigatório.', HttpStatus.BAD_REQUEST);
      }
      item.storageLocation = location;
    }

    if (data.notes !== undefined) {
      item.notes = cleanText(data.notes);
    }

    await this.itemsRepository.save(item);
    const reloaded = await this.loadItemOrFail(item.id);
    return this.mapItem(reloaded);
  }

  async disposeItem(id: number, data: DisposeInventoryItemDto) {
    const item = await this.loadItemOrFail(id);

    if (item.status === 'Baixado') {
      throw new HttpException('Item já está baixado.', HttpStatus.BAD_REQUEST);
    }

    const openLoan = await this.loansRepository.findOne({
      where: {
        itemId: item.id,
        status: 'Aberto'
      }
    });

    if (openLoan) {
      throw new HttpException(
        'Não é possível dar baixa em item com empréstimo em aberto.',
        HttpStatus.BAD_REQUEST
      );
    }

    item.status = 'Baixado';
    item.disposedAt = new Date();
    item.disposalReason = data.reason.trim();
    item.notes = cleanText([item.notes, cleanText(data.notes)].filter(Boolean).join('\n'));

    await this.itemsRepository.save(item);
    const reloaded = await this.loadItemOrFail(item.id);
    return this.mapItem(reloaded);
  }

  async deleteItem(id: number) {
    const item = await this.loadItemOrFail(id);

    const [loanCount, maintenanceCount] = await Promise.all([
      this.loansRepository.count({ where: { itemId: id } }),
      this.maintenanceRepository.count({ where: { itemId: id } })
    ]);

    if (loanCount > 0 || maintenanceCount > 0) {
      throw new HttpException(
        'Item com histórico de empréstimo/manutenção não pode ser excluído. Utilize baixa patrimonial.',
        HttpStatus.BAD_REQUEST
      );
    }

    await this.itemsRepository.remove(item);
    return { id };
  }

  async listLoans() {
    const loans = await this.loansRepository.find({
      relations: {
        item: true,
        originMinistry: true,
        destinationMinistry: true
      },
      order: {
        loanedAt: 'DESC'
      }
    });

    return loans.map((loan) => this.mapLoan(loan));
  }

  async createLoan(data: CreateInventoryLoanDto) {
    const item = await this.loadItemOrFail(data.item_id);

    if (item.status === 'Baixado') {
      throw new HttpException(
        'Não é possível emprestar item já baixado.',
        HttpStatus.BAD_REQUEST
      );
    }

    if (item.status === 'Emprestado') {
      throw new HttpException('Item já possui empréstimo em aberto.', HttpStatus.BAD_REQUEST);
    }

    if (item.ministryId === data.destination_ministry_id) {
      throw new HttpException(
        'O ministério de destino deve ser diferente do ministério de origem.',
        HttpStatus.BAD_REQUEST
      );
    }

    await this.loadMinistryOrFail(data.destination_ministry_id);

    const loan = await this.loansRepository.save(
      this.loansRepository.create({
        itemId: item.id,
        originMinistryId: item.ministryId,
        destinationMinistryId: data.destination_ministry_id,
        loanedAt: new Date(),
        expectedReturnDate: data.expected_return_date || null,
        status: 'Aberto',
        notes: cleanText(data.notes)
      })
    );

    item.status = 'Emprestado';
    await this.itemsRepository.save(item);

    const reloaded = await this.loansRepository.findOne({
      where: { id: loan.id },
      relations: { item: true, originMinistry: true, destinationMinistry: true }
    });

    if (!reloaded) {
      throw new HttpException('Erro ao carregar empréstimo.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.mapLoan(reloaded);
  }

  async returnLoan(id: number, data: ReturnInventoryLoanDto) {
    const loan = await this.loansRepository.findOne({
      where: { id },
      relations: { item: true, originMinistry: true, destinationMinistry: true }
    });

    if (!loan) {
      throw new HttpException('Empréstimo não encontrado.', HttpStatus.NOT_FOUND);
    }

    if (loan.status !== 'Aberto') {
      throw new HttpException('Empréstimo já está encerrado.', HttpStatus.BAD_REQUEST);
    }

    loan.status = 'Fechado';
    loan.returnedAt = new Date();
    loan.notes = cleanText([loan.notes, cleanText(data.notes)].filter(Boolean).join('\n'));

    await this.loansRepository.save(loan);

    const item = await this.loadItemOrFail(loan.itemId);
    if (item.status !== 'Baixado') {
      item.status = 'Disponivel';
      await this.itemsRepository.save(item);
    }

    const reloaded = await this.loansRepository.findOne({
      where: { id: loan.id },
      relations: { item: true, originMinistry: true, destinationMinistry: true }
    });

    if (!reloaded) {
      throw new HttpException('Erro ao carregar empréstimo.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.mapLoan(reloaded);
  }

  async listMaintenanceRequests() {
    const requests = await this.maintenanceRepository.find({
      relations: { item: true, requesterMinistry: true },
      order: { requestedAt: 'DESC' }
    });

    return requests.map((request) => this.mapMaintenance(request));
  }

  async createMaintenanceRequest(data: CreateInventoryMaintenanceDto) {
    const item = await this.loadItemOrFail(data.item_id);
    await this.loadMinistryOrFail(data.requester_ministry_id);

    if (item.status === 'Baixado') {
      throw new HttpException(
        'Item baixado não pode receber manutenção.',
        HttpStatus.BAD_REQUEST
      );
    }

    const reportNumber = await this.generateMaintenanceReportNumber();
    const request = await this.maintenanceRepository.save(
      this.maintenanceRepository.create({
        itemId: item.id,
        requesterMinistryId: data.requester_ministry_id,
        reportNumber,
        description: data.description.trim(),
        priority: data.priority || 'Média',
        status: 'Aberta',
        requestedAt: new Date(),
        dueDate: data.due_date || null
      })
    );

    if (item.status !== 'Baixado') {
      item.status = 'EmManutencao';
      await this.itemsRepository.save(item);
    }

    const reloaded = await this.maintenanceRepository.findOne({
      where: { id: request.id },
      relations: { item: true, requesterMinistry: true }
    });

    if (!reloaded) {
      throw new HttpException('Erro ao carregar manutenção.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.mapMaintenance(reloaded);
  }

  async updateMaintenanceRequest(id: number, data: UpdateInventoryMaintenanceDto) {
    const request = await this.maintenanceRepository.findOne({
      where: { id },
      relations: { item: true, requesterMinistry: true }
    });

    if (!request) {
      throw new HttpException('Solicitação de manutenção não encontrada.', HttpStatus.NOT_FOUND);
    }

    if (data.priority !== undefined) {
      request.priority = data.priority;
    }

    if (data.status !== undefined) {
      request.status = data.status;
      request.resolvedAt = data.status === 'Resolvida' ? new Date() : null;
    }

    if (data.due_date !== undefined) {
      request.dueDate = data.due_date || null;
    }

    if (data.resolution_notes !== undefined) {
      request.resolutionNotes = cleanText(data.resolution_notes);
    }

    await this.maintenanceRepository.save(request);

    const item = await this.loadItemOrFail(request.itemId);
    if (item.status !== 'Baixado') {
      const hasOpenMaintenance = await this.maintenanceRepository.count({
        where: {
          itemId: request.itemId,
          status: 'Aberta'
        }
      });
      const hasInProgressMaintenance = await this.maintenanceRepository.count({
        where: {
          itemId: request.itemId,
          status: 'EmAndamento'
        }
      });
      const hasOpenLoan = await this.loansRepository.count({
        where: {
          itemId: request.itemId,
          status: 'Aberto'
        }
      });

      if (hasOpenMaintenance > 0 || hasInProgressMaintenance > 0) {
        item.status = 'EmManutencao';
      } else if (hasOpenLoan > 0) {
        item.status = 'Emprestado';
      } else {
        item.status = 'Disponivel';
      }
      await this.itemsRepository.save(item);
    }

    const reloaded = await this.maintenanceRepository.findOne({
      where: { id: request.id },
      relations: { item: true, requesterMinistry: true }
    });

    if (!reloaded) {
      throw new HttpException('Erro ao carregar manutenção.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.mapMaintenance(reloaded);
  }

  async maintenanceReport() {
    const requests = await this.listMaintenanceRequests();

    const summary = requests.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === 'Aberta') acc.abertas += 1;
        if (item.status === 'EmAndamento') acc.em_andamento += 1;
        if (item.status === 'Resolvida') acc.resolvidas += 1;
        if (item.priority === 'Alta') acc.prioridade_alta += 1;
        return acc;
      },
      {
        total: 0,
        abertas: 0,
        em_andamento: 0,
        resolvidas: 0,
        prioridade_alta: 0
      }
    );

    return {
      generated_at: new Date().toISOString(),
      summary,
      requests
    };
  }

  private async loadItemOrFail(id: number) {
    const item = await this.itemsRepository.findOne({
      where: { id },
      relations: { ministry: true }
    });

    if (!item) {
      throw new HttpException('Item de inventário não encontrado.', HttpStatus.NOT_FOUND);
    }

    return item;
  }

  private async loadMinistryOrFail(id: number) {
    const ministry = await this.ministriesRepository.findOne({ where: { id } });
    if (!ministry) {
      throw new HttpException('Ministério não encontrado.', HttpStatus.BAD_REQUEST);
    }
    return ministry;
  }

  private async assertPatrimonyAvailable(patrimonyNumber: string, ignoreItemId?: number) {
    const existing = await this.itemsRepository.findOne({
      where: { patrimonyNumber }
    });
    if (existing && existing.id !== ignoreItemId) {
      throw new HttpException(
        'Número de patrimônio já cadastrado.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async generatePatrimonyNumber(ministryId: number) {
    const shortNameRaw =
      this.configService.get<string>('VITE_CHURCH_SHORT_NAME') ||
      this.configService.get<string>('CHURCH_SHORT_NAME') ||
      'IPIGG';
    const shortName = shortNameRaw
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12);
    const base = `${shortName || 'IPIGG'}-${todayDdMmYy()}-${ministryId}`;

    for (let attempt = 0; attempt < 8; attempt++) {
      const random = Math.floor(1000 + Math.random() * 9000);
      const patrimony = `${base}-${random}`;
      const existing = await this.itemsRepository.findOne({
        where: { patrimonyNumber: patrimony }
      });
      if (!existing) return patrimony;
    }

    throw new HttpException(
      'Falha ao gerar número de patrimônio automático.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private async generateMaintenanceReportNumber() {
    const prefix = `MAN-${normalizeReportDate()}`;

    for (let attempt = 0; attempt < 8; attempt++) {
      const random = Math.floor(100 + Math.random() * 900);
      const reportNumber = `${prefix}-${random}`;
      const existing = await this.maintenanceRepository.findOne({
        where: { reportNumber }
      });
      if (!existing) return reportNumber;
    }

    throw new HttpException(
      'Falha ao gerar número do relatório de manutenção.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private mapItem(item: InventoryItem) {
    return {
      id: item.id,
      ministry_id: item.ministryId,
      ministry_name: item.ministry?.name || null,
      name: item.name,
      patrimony_number: item.patrimonyNumber,
      storage_location: item.storageLocation,
      status: item.status,
      notes: item.notes || null,
      disposed_at: item.disposedAt ? item.disposedAt.toISOString() : null,
      disposal_reason: item.disposalReason || null,
      created_at: item.createdAt?.toISOString?.() || null,
      updated_at: item.updatedAt?.toISOString?.() || null
    };
  }

  private mapLoan(loan: InventoryLoan) {
    return {
      id: loan.id,
      item_id: loan.itemId,
      item_name: loan.item?.name || null,
      item_patrimony_number: loan.item?.patrimonyNumber || null,
      origin_ministry_id: loan.originMinistryId,
      origin_ministry_name: loan.originMinistry?.name || null,
      destination_ministry_id: loan.destinationMinistryId,
      destination_ministry_name: loan.destinationMinistry?.name || null,
      loaned_at: loan.loanedAt?.toISOString?.() || null,
      expected_return_date: loan.expectedReturnDate || null,
      returned_at: loan.returnedAt ? loan.returnedAt.toISOString() : null,
      status: loan.status,
      notes: loan.notes || null,
      created_at: loan.createdAt?.toISOString?.() || null,
      updated_at: loan.updatedAt?.toISOString?.() || null
    };
  }

  private mapMaintenance(request: InventoryMaintenanceRequest) {
    return {
      id: request.id,
      item_id: request.itemId,
      item_name: request.item?.name || null,
      item_patrimony_number: request.item?.patrimonyNumber || null,
      requester_ministry_id: request.requesterMinistryId,
      requester_ministry_name: request.requesterMinistry?.name || null,
      report_number: request.reportNumber,
      description: request.description,
      priority: request.priority,
      status: request.status,
      requested_at: request.requestedAt?.toISOString?.() || null,
      due_date: request.dueDate || null,
      resolved_at: request.resolvedAt ? request.resolvedAt.toISOString() : null,
      resolution_notes: request.resolutionNotes || null,
      created_at: request.createdAt?.toISOString?.() || null,
      updated_at: request.updatedAt?.toISOString?.() || null
    };
  }
}
