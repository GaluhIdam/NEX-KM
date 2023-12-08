import { Component } from '@angular/core';
import { PopularInterface } from '../../interfaces/popular-interface';
import { faArrowRight, faBookBookmark, faBookOpen, faImage, faSearch, faStar, faBars } from '@fortawesome/free-solid-svg-icons';
import { BookInterface } from '../../interfaces/book-interfaces';

@Component({
  selector: 'app-my-directory',
  templateUrl: './my-directory.component.html',
  styleUrls: ['./my-directory.component.css']
})
export class MyDirectoryComponent {
  faArrowRight = faArrowRight
  faBookOpen = faBookOpen
  faImage = faImage
  faSearch = faSearch
  faBookBookmark = faBookBookmark
  faStar = faStar
  faBars = faBars
  //Data Popular
  data_popular: Array<PopularInterface> = [
    {
      id: 1,
      name: 'Action'
    },
    {
      id: 2,
      name: 'Adventure'
    },
    {
      id: 3,
      name: 'Autobiography'
    },
    {
      id: 4,
      name: 'Comedy'
    },
    {
      id: 5,
      name: 'Crime'
    },
    {
      id: 6,
      name: 'Drama'
    },
    {
      id: 7,
      name: 'Dystopian'
    },
    {
      id: 8,
      name: 'Horor'
    },
    {
      id: 9,
      name: 'Mystery'
    },
    {
      id: 10,
      name: 'Romance'
    },
    {
      id: 11,
      name: 'Sci-Fi'
    },
    {
      id: 12,
      name: 'Self-Help'
    },
    {
      id: 13,
      name: 'Thriller'
    },
    {
      id: 14,
      name: 'Young Adult'
    },
  ]

  //Book Data
  data_book: Array<BookInterface> = [
    {
      id: 1,
      cover: "https://www.displayr.com/wp-content/uploads/2018/09/ClusteredColumnChart_780x480.png",
      title: "Jackalby",
      writer: "www.gmf-aeroasia.co.id",
      description: 'Lorem ipsum, atau ringkasnya lipsum, adalah teks standar yang ditempatkan untuk mendemostrasikan elemen grafis atau presentasi visual seperti font, tipografi, dan tata letak.',
    },
    {
      id: 2,
      cover: "https://www.displayr.com/wp-content/uploads/2018/09/ClusteredColumnChart_780x480.png",
      title: "The Vegetarian",
      writer: "www.gmf-aeroasia.co.id",
      description: 'Lorem ipsum, atau ringkasnya lipsum, adalah teks standar yang ditempatkan untuk mendemostrasikan elemen grafis atau presentasi visual seperti font, tipografi, dan tata letak.',
    },
    {
      id: 3,
      cover: "https://www.displayr.com/wp-content/uploads/2018/09/ClusteredColumnChart_780x480.png",
      title: "Playing Dead",
      writer: "www.gmf-aeroasia.co.id",
      description: 'Lorem ipsum, atau ringkasnya lipsum, adalah teks standar yang ditempatkan untuk mendemostrasikan elemen grafis atau presentasi visual seperti font, tipografi, dan tata letak.',
    },
    {
      id: 4,
      cover: "https://www.displayr.com/wp-content/uploads/2018/09/ClusteredColumnChart_780x480.png",
      title: "Galloway's Justice",
      writer: "www.gmf-aeroasia.co.id",
      description: 'Lorem ipsum, atau ringkasnya lipsum, adalah teks standar yang ditempatkan untuk mendemostrasikan elemen grafis atau presentasi visual seperti font, tipografi, dan tata letak.',
    },
    {
      id: 5,
      cover: "https://www.displayr.com/wp-content/uploads/2018/09/ClusteredColumnChart_780x480.png",
      title: "Us",
      writer: "www.gmf-aeroasia.co.id",
      description: 'Lorem ipsum, atau ringkasnya lipsum, adalah teks standar yang ditempatkan untuk mendemostrasikan elemen grafis atau presentasi visual seperti font, tipografi, dan tata letak.',
    },
    {
      id: 6,
      cover: "https://www.displayr.com/wp-content/uploads/2018/09/ClusteredColumnChart_780x480.png",
      title: "A Teaspoon of Earth and Sea",
      writer: "www.gmf-aeroasia.co.id",
      description: 'Lorem ipsum, atau ringkasnya lipsum, adalah teks standar yang ditempatkan untuk mendemostrasikan elemen grafis atau presentasi visual seperti font, tipografi, dan tata letak.',
    },
  ]
}
