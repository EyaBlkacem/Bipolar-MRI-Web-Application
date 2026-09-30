import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {

  private api = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<any[]>(this.api);
  }

deleteUser(id: number) {
  return this.http.delete(`http://localhost:3000/api/users/${id}`);
}

  blockUser(id: number) {
    return this.http.put(`${this.api}/block/${id}`, {});
  }

  getUser(id: number) {
    return this.http.get(`${this.api}/${id}`);
  }

}
