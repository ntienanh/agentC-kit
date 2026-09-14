import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@shared/decorators';
import { DoctorService } from '../application/doctor.service';
import { AppointmentService } from '../application/appointment.service';
import { QueueService } from '../application/queue.service';
import { ClinicalService } from '../application/clinical.service';
import { BillingService } from '../application/billing.service';
import { ClinicDashboardService } from '../application/clinic-dashboard.service';
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
  CreateAppointmentDto,
  AppointmentDto,
  CancelAppointmentDto,
  RescheduleAppointmentDto,
  CheckInAppointmentDto,
  CallQueueTicketDto,
  QueueTicketDto,
  CompleteConsultationDto,
  ConsultationDto,
  MedicalRecordDto,
  ProcessPaymentDto,
  PaymentRecordDto,
  ClinicDashboardMetricsDto,
} from '@repo/contracts';

@ApiTags('Healthcare')
@Controller('api/v1/healthcare')
export class HealthcareController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly appointmentService: AppointmentService,
    private readonly queueService: QueueService,
    private readonly clinicalService: ClinicalService,
    private readonly billingService: BillingService,
    private readonly dashboardService: ClinicDashboardService,
  ) {}

  @Get('doctors')
  @Public()
  findAllDoctors(): Promise<DoctorProfileDto[]> {
    return this.doctorService.findAllDoctors();
  }

  @Get('doctors/:id')
  @Public()
  findDoctorById(@Param('id') id: string): Promise<DoctorProfileDto> {
    return this.doctorService.findDoctorById(id);
  }

  @Post('doctors')
  @Public()
  createDoctor(@Body() dto: CreateDoctorProfileDto): Promise<DoctorProfileDto> {
    return this.doctorService.createDoctor(dto);
  }

  @Put('doctors/:id')
  @Public()
  updateDoctor(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorProfileDto,
  ): Promise<DoctorProfileDto> {
    return this.doctorService.updateDoctor(id, dto);
  }

  @Get('services')
  @Public()
  findAllServices(): Promise<ClinicServiceDto[]> {
    return this.doctorService.findAllServices();
  }

  @Get('services/:id')
  @Public()
  findServiceById(@Param('id') id: string): Promise<ClinicServiceDto> {
    return this.doctorService.findServiceById(id);
  }

  @Post('services')
  @Public()
  createService(
    @Body() dto: CreateClinicServiceDto,
  ): Promise<ClinicServiceDto> {
    return this.doctorService.createService(dto);
  }

  @Put('services/:id')
  @Public()
  updateService(
    @Param('id') id: string,
    @Body() dto: UpdateClinicServiceDto,
  ): Promise<ClinicServiceDto> {
    return this.doctorService.updateService(id, dto);
  }

  @Get('rooms')
  @Public()
  findAllRooms(): Promise<RoomDto[]> {
    return this.doctorService.findAllRooms();
  }

  @Get('rooms/:id')
  @Public()
  findRoomById(@Param('id') id: string): Promise<RoomDto> {
    return this.doctorService.findRoomById(id);
  }

  @Post('rooms')
  @Public()
  createRoom(@Body() dto: CreateRoomDto): Promise<RoomDto> {
    return this.doctorService.createRoom(dto);
  }

  @Get('schedules')
  @Public()
  findSchedules(
    @Query('doctorId') doctorId: string,
  ): Promise<DoctorScheduleDto[]> {
    return this.doctorService.findSchedulesByDoctorId(doctorId);
  }

  @Post('schedules')
  @Public()
  createSchedule(
    @Body() dto: CreateDoctorScheduleDto,
  ): Promise<DoctorScheduleDto> {
    return this.doctorService.createSchedule(dto);
  }

  @Get('leaves')
  @Public()
  findLeaves(@Query('doctorId') doctorId: string): Promise<DoctorLeaveDto[]> {
    return this.doctorService.findLeavesByDoctorId(doctorId);
  }

  @Post('leaves')
  @Public()
  createLeave(@Body() dto: CreateDoctorLeaveDto): Promise<DoctorLeaveDto> {
    return this.doctorService.createLeave(dto);
  }

  @Get('availability')
  @Public()
  getAvailableSlots(
    @Query() query: AvailableSlotQueryDto,
  ): Promise<AvailableSlotResponseDto> {
    return this.doctorService.getAvailableSlots(query);
  }

  @Post('appointments')
  @Public()
  bookAppointment(@Body() dto: CreateAppointmentDto): Promise<AppointmentDto> {
    return this.appointmentService.bookAppointment(dto);
  }

  @Get('appointments')
  @Public()
  findAllAppointments(
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
    @Query('patientId') patientId?: string,
  ): Promise<AppointmentDto[]> {
    return this.appointmentService.findAll({ doctorId, date, patientId });
  }

  @Get('appointments/:id')
  @Public()
  findAppointmentById(@Param('id') id: string): Promise<AppointmentDto> {
    return this.appointmentService.findById(id);
  }

  @Post('appointments/cancel')
  @Public()
  cancelAppointment(
    @Body() dto: CancelAppointmentDto,
  ): Promise<AppointmentDto> {
    return this.appointmentService.cancelAppointment(dto);
  }

  @Post('appointments/reschedule')
  @Public()
  rescheduleAppointment(
    @Body() dto: RescheduleAppointmentDto,
  ): Promise<AppointmentDto> {
    return this.appointmentService.rescheduleAppointment(dto);
  }

  @Post('queue/check-in')
  @Public()
  checkIn(@Body() dto: CheckInAppointmentDto): Promise<QueueTicketDto> {
    return this.queueService.checkIn(dto);
  }

  @Post('queue/call-next')
  @Public()
  callNext(@Body() dto: CallQueueTicketDto): Promise<QueueTicketDto> {
    return this.queueService.callNext(dto);
  }

  @Post('queue/:ticketId/start')
  @Public()
  startConsultation(
    @Param('ticketId') ticketId: string,
  ): Promise<QueueTicketDto> {
    return this.queueService.startConsultation(ticketId);
  }

  @Post('queue/:ticketId/skip')
  @Public()
  skipQueue(@Param('ticketId') ticketId: string): Promise<QueueTicketDto> {
    return this.queueService.skip(ticketId);
  }

  @Get('queue')
  @Public()
  getDailyQueue(@Query('date') date: string): Promise<QueueTicketDto[]> {
    return this.queueService.getDailyQueue(date);
  }

  @Post('consultations/complete')
  @Public()
  completeConsultation(
    @Body() dto: CompleteConsultationDto,
  ): Promise<ConsultationDto> {
    return this.clinicalService.completeConsultation(dto);
  }

  @Get('consultations/:appointmentId')
  @Public()
  getConsultation(
    @Param('appointmentId') appointmentId: string,
  ): Promise<ConsultationDto> {
    return this.clinicalService.getConsultationByAppointmentId(appointmentId);
  }

  @Get('medical-records/:patientId')
  @Public()
  getMedicalRecord(
    @Param('patientId') patientId: string,
  ): Promise<MedicalRecordDto> {
    return this.clinicalService.getMedicalRecordByPatientId(patientId);
  }

  @Post('payments')
  @Public()
  processPayment(@Body() dto: ProcessPaymentDto): Promise<PaymentRecordDto> {
    return this.billingService.processPayment(dto);
  }

  @Get('payments/:appointmentId')
  @Public()
  getPayment(
    @Param('appointmentId') appointmentId: string,
  ): Promise<PaymentRecordDto> {
    return this.billingService.getPaymentByAppointmentId(appointmentId);
  }

  @Get('dashboard')
  @Public()
  getDashboardMetrics(
    @Query('date') date: string,
  ): Promise<ClinicDashboardMetricsDto> {
    return this.dashboardService.getMetrics(date);
  }
}
