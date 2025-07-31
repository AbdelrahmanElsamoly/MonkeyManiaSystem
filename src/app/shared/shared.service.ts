import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  baseUrl = 'https://monkey-mania-production.up.railway.app';

  constructor(private http: HttpClient) {}

  // Get Branches Api
  getBranches() {
    return this.http.get(`${this.baseUrl}/branch/all/`);
  }

  getMaterials(branchId: any) {
    return this.http.get(
      `${this.baseUrl}/branch_material/all?branch_id=${branchId}`
    );
  }
  getAllNonActiveChildren() {
    return this.http.get(`${this.baseUrl}/child/non_active/all/`);
  }
  createBill(body: any) {
    return this.http.post(`${this.baseUrl}/bill/create/`, body);
  }
}
