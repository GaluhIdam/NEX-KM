import { Injectable } from '@angular/core';
import { EbookDTO, ForumDTO, PhotoGalleryDTO, PodcastDTO, UsersDTO } from '../dtos/searchResults';


@Injectable({
  providedIn: 'root'
})
export class searchResultsServices {

  urlEbook = 'http://localhost:3000/ebook';
  urlPhoto = 'http://localhost:3000/photo';
  urlForum = 'http://localhost:3000/forum';
  urlPodcast = 'http://localhost:3000/podcast';
  urlUsers = 'http://localhost:3000/users';

  async getAllEbook(): Promise<EbookDTO[]> {
    const data = await fetch(this.urlEbook)
    return await data.json() ?? [];
  }

  async getEbookById(id: number):
  Promise<EbookDTO |  undefined> {
    const data = await fetch(`${this.urlEbook}/${id}`)
    return await data.json() ?? {};
  }

  async getAllPhoto(): Promise<PhotoGalleryDTO[]> {
    const data = await fetch(this.urlPhoto)
    return await data.json() ?? [];
  }

  async getPhotoById(id: number):
  Promise<PhotoGalleryDTO |  undefined> {
    const data = await fetch(`${this.urlPhoto}/${id}`)
    return await data.json() ?? {};
  }

  async getAllForum(): Promise<ForumDTO[]> {
    const data = await fetch(this.urlForum)
    return await data.json() ?? [];
  }

  async getForumId(id: number):
  Promise<ForumDTO |  undefined> {
    const data = await fetch(`${this.urlForum}/${id}`)
    return await data.json() ?? {};
  }
  async getAllPodcast(): Promise<PodcastDTO[]> {
    const data = await fetch(this.urlForum)
    return await data.json() ?? [];
  }

  async getPodcastId(id: number):
  Promise<PodcastDTO |  undefined> {
    const data = await fetch(`${this.urlPodcast}/${id}`)
    return await data.json() ?? {};
  }

  async getAllUsers(): Promise<UsersDTO[]> {
    const data = await fetch(this.urlUsers)
    return await data.json() ?? [];
  }

  async getUsersId(id: number):
  Promise<UsersDTO |  undefined> {
    const data = await fetch(`${this.urlUsers}/${id}`)
    return await data.json() ?? {};
  }
}
