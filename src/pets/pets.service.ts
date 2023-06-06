import { Injectable } from '@nestjs/common';
import { Pet } from './pet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePetInput } from './dto/create-pet.input';
import { OwnersService } from 'src/owners/owners.service';
import { Owner } from 'src/owners/entities/owner.entity';

@Injectable()
export class PetsService {
  static PET_PET_PAGE = 2;

  constructor(
    @InjectRepository(Pet) private petsRepository: Repository<Pet>,
    private ownersService: OwnersService,
  ) {}

  createPet(createPetInput: CreatePetInput): Promise<Pet> {
    const newPet = this.petsRepository.create(createPetInput);
    return this.petsRepository.save(newPet);
  }

  async findAll(page: number = 0): Promise<Pet[]> {
    const skip: number = page <= 0 ? 0 : page * PetsService.PET_PET_PAGE;
    return this.petsRepository.find({
      take: PetsService.PET_PET_PAGE,
      skip,
    });
  }

  async findOne(id: number): Promise<Pet> {
    return this.petsRepository.findOneOrFail({
      where: {
        id,
      },
    });
  }

  getOwner(ownerId: number): Promise<Owner> {
    return this.ownersService.findOne(ownerId);
  }

  public async getAllPetsByOwnerIds(
    ownerIds: readonly number[],
  ): Promise<Pet[]> {
    return this.petsRepository.find({ where: { id: In([...ownerIds]) } });
  }

  public async getOwnersPetsByBatch(
    ownersIds: readonly number[],
  ): Promise<(Pet | any)[]> {
    console.log(ownersIds);

    const pets = await this.getAllPetsByOwnerIds(ownersIds);
    const mappedResults = this._mapResultToIds(ownersIds, pets);
    return mappedResults;
  }

  private _mapResultToIds(ownersIds: readonly number[], pets: Pet[]) {
    return ownersIds.map(
      (id) => pets.filter((pet: Pet) => pet.ownerId === id) || null,
    );
  }
}
