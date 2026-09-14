import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryHealthcareRepository } from '../infrastructure/persistence/in-memory-healthcare.repository';
import { DoctorEntity } from '../domain/doctor.entity';
import { ClinicServiceEntity } from '../domain/clinic-service.entity';
import { RoomEntity } from '../domain/room.entity';
import { DoctorScheduleEntity } from '../domain/doctor-schedule.entity';
import { DoctorLeaveEntity } from '../domain/doctor-leave.entity';
import {
  DoctorProfileDto,
  CreateDoctorProfileDto,
  UpdateDoctorProfileDto,
  ClinicServiceDto,
  CreateClinicServiceDto,
  UpdateClinicServiceDto,
  RoomDto,
  CreateRoomDto,
  DoctorScheduleDto,
  CreateDoctorScheduleDto,
  DoctorLeaveDto,
  CreateDoctorLeaveDto,
  AvailableSlotQueryDto,
  AvailableSlotResponseDto,
} from '@repo/contracts';

@Injectable()
export class DoctorService {
  constructor(private readonly repo: InMemoryHealthcareRepository) {}

  async findAllDoctors(): Promise<DoctorProfileDto[]> {
    const doctors = await this.repo.findAllDoctors();
    return doctors.map((d) => d.toDto());
  }

  async findDoctorById(id: string): Promise<DoctorProfileDto> {
    const doctor = await this.repo.findDoctorById(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }
    return doctor.toDto();
  }

  async createDoctor(dto: CreateDoctorProfileDto): Promise<DoctorProfileDto> {
    const doctor = new DoctorEntity({
      userId: dto.userId,
      fullName: dto.fullName,
      specialty: dto.specialty,
      licenseNumber: dto.licenseNumber,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      roomNumber: dto.roomNumber,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.repo.saveDoctor(doctor);
    return saved.toDto();
  }

  async updateDoctor(
    id: string,
    dto: UpdateDoctorProfileDto,
  ): Promise<DoctorProfileDto> {
    const doctor = await this.repo.findDoctorById(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }
    doctor.updateDetails({
      fullName: dto.fullName,
      specialty: dto.specialty,
      licenseNumber: dto.licenseNumber,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      roomNumber: dto.roomNumber,
      isActive: dto.isActive,
    });
    const saved = await this.repo.saveDoctor(doctor);
    return saved.toDto();
  }

  async findAllServices(): Promise<ClinicServiceDto[]> {
    const services = await this.repo.findAllServices();
    return services.map((s) => s.toDto());
  }

  async findServiceById(id: string): Promise<ClinicServiceDto> {
    const service = await this.repo.findServiceById(id);
    if (!service) {
      throw new NotFoundException(`Clinic service with id ${id} not found`);
    }
    return service.toDto();
  }

  async createService(dto: CreateClinicServiceDto): Promise<ClinicServiceDto> {
    const service = new ClinicServiceEntity({
      name: dto.name,
      code: dto.code,
      description: dto.description,
      durationMinutes: dto.durationMinutes,
      price: dto.price,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.repo.saveService(service);
    return saved.toDto();
  }

  async updateService(
    id: string,
    dto: UpdateClinicServiceDto,
  ): Promise<ClinicServiceDto> {
    const service = await this.repo.findServiceById(id);
    if (!service) {
      throw new NotFoundException(`Clinic service with id ${id} not found`);
    }
    service.updateDetails({
      name: dto.name,
      code: dto.code,
      description: dto.description,
      durationMinutes: dto.durationMinutes,
      price: dto.price,
      isActive: dto.isActive,
    });
    const saved = await this.repo.saveService(service);
    return saved.toDto();
  }

  async findAllRooms(): Promise<RoomDto[]> {
    const rooms = await this.repo.findAllRooms();
    return rooms.map((r) => r.toDto());
  }

  async findRoomById(id: string): Promise<RoomDto> {
    const room = await this.repo.findRoomById(id);
    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }
    return room.toDto();
  }

  async createRoom(dto: CreateRoomDto): Promise<RoomDto> {
    const room = new RoomEntity({
      roomNumber: dto.roomNumber,
      name: dto.name,
      description: dto.description,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.repo.saveRoom(room);
    return saved.toDto();
  }

  async findSchedulesByDoctorId(
    doctorId: string,
  ): Promise<DoctorScheduleDto[]> {
    const schedules = await this.repo.findSchedulesByDoctorId(doctorId);
    return schedules.map((s) => s.toDto());
  }

  async createSchedule(
    dto: CreateDoctorScheduleDto,
  ): Promise<DoctorScheduleDto> {
    const schedule = new DoctorScheduleEntity({
      doctorId: dto.doctorId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      breakStartTime: dto.breakStartTime,
      breakEndTime: dto.breakEndTime,
      slotDurationMinutes: dto.slotDurationMinutes,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.repo.saveSchedule(schedule);
    return saved.toDto();
  }

  async findLeavesByDoctorId(doctorId: string): Promise<DoctorLeaveDto[]> {
    const leaves = await this.repo.findLeavesByDoctorId(doctorId);
    return leaves.map((l) => l.toDto());
  }

  async createLeave(dto: CreateDoctorLeaveDto): Promise<DoctorLeaveDto> {
    const leave = new DoctorLeaveEntity({
      doctorId: dto.doctorId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason,
      isApproved: dto.isApproved ?? true,
    });
    const saved = await this.repo.saveLeave(leave);
    return saved.toDto();
  }

  async getAvailableSlots(
    query: AvailableSlotQueryDto,
  ): Promise<AvailableSlotResponseDto> {
    const doctor = await this.repo.findDoctorById(query.doctorId);
    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${query.doctorId} not found`);
    }

    if (!doctor.isActive) {
      return {
        doctorId: query.doctorId,
        date: query.date,
        slots: [],
        slotDurationMinutes: 30,
      };
    }

    const leaves = await this.repo.findLeavesByDoctorId(query.doctorId);
    const hasLeave = leaves.some((l) => l.coversDate(query.date));
    if (hasLeave) {
      return {
        doctorId: query.doctorId,
        date: query.date,
        slots: [],
        slotDurationMinutes: 30,
      };
    }

    const [year, month, day] = query.date.split('-').map(Number);
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

    const schedules = await this.repo.findSchedulesByDoctorId(query.doctorId);
    const schedule = schedules.find(
      (s) => s.dayOfWeek === dayOfWeek && s.isActive,
    );
    if (!schedule) {
      return {
        doctorId: query.doctorId,
        date: query.date,
        slots: [],
        slotDurationMinutes: 30,
      };
    }

    let duration = schedule.slotDurationMinutes;
    if (query.serviceId) {
      const service = await this.repo.findServiceById(query.serviceId);
      if (service) {
        duration = service.durationMinutes;
      }
    }

    const [sh, sm] = schedule.startTime.split(':').map(Number);
    const [eh, em] = schedule.endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    let breakStartMin: number | null = null;
    let breakEndMin: number | null = null;
    if (schedule.breakStartTime && schedule.breakEndTime) {
      const [bsh, bsm] = schedule.breakStartTime.split(':').map(Number);
      const [beh, bem] = schedule.breakEndTime.split(':').map(Number);
      breakStartMin = bsh * 60 + bsm;
      breakEndMin = beh * 60 + bem;
    }

    const appointments = await this.repo.findAppointmentsByDoctorAndDate(
      query.doctorId,
      query.date,
    );
    const activeAppointments = appointments.filter((a) => a.isActive());

    const slots: string[] = [];
    for (let cur = startMin; cur + duration <= endMin; cur += duration) {
      if (breakStartMin !== null && breakEndMin !== null) {
        if (cur < breakEndMin && cur + duration > breakStartMin) {
          continue;
        }
      }

      const h = Math.floor(cur / 60);
      const m = cur % 60;
      const slotStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      const isBooked = activeAppointments.some((a) => {
        const aStart = a.timeSlot.includes('-')
          ? a.timeSlot.split('-')[0].trim()
          : a.timeSlot.trim();
        return aStart === slotStr;
      });

      if (!isBooked) {
        slots.push(slotStr);
      }
    }

    return {
      doctorId: query.doctorId,
      date: query.date,
      slots,
      slotDurationMinutes: duration,
    };
  }
}
