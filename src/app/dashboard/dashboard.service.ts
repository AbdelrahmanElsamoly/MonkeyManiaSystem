import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  baseUrl = 'https://monkey-mania-production.up.railway.app';

  constructor(private http: HttpClient) {}

  // schools Api
  getSchools(searchQuery: string = '') {
    let params = {};
    if (searchQuery) {
      params = { params: { search: searchQuery } };
    }

    return this.http.get(`${this.baseUrl}/school/all/`, params);
  }

  createSchool(schoolData: any) {
    return this.http.post(`${this.baseUrl}/school/create/`, schoolData);
  }

  updateSchool(schoolId: string, schoolData: any) {
    return this.http.put(
      `${this.baseUrl}/school/${schoolId}/update/`,
      schoolData
    );
  }
  getSchoolById(schoolId: string) {
    return this.http.get(`${this.baseUrl}/school/${schoolId}/`);
  }

  uploadBulkSchool(file: any) {
    return this.http.post(`${this.baseUrl}/school/bulk_create/`, file);
  }
  // mainpAge Api
  getStatistics(branchId: any) {
    let params = {};
    if (branchId) {
      params = new HttpParams().set('branch_id', branchId);
      return this.http.get(`${this.baseUrl}/dashboard/statistics`, { params });
    } else if (branchId == null) {
      return this.http.get(`${this.baseUrl}/dashboard/statistics`);
    }
    // Default return to handle all code paths
    return this.http.get(`${this.baseUrl}/dashboard/statistics`);
  }

  // children Api
  getChild(searchQuery: string = '') {
    let params = {};
    if (searchQuery) {
      params = { params: { search: searchQuery } };
    }

    return this.http.get(`${this.baseUrl}/child/all/`, params);
  }
  getChildById(childId: any) {
    return this.http.get(`${this.baseUrl}/child/${childId}/`);
  }

  createChild(body: any) {
    return this.http.post(`${this.baseUrl}/child/create/`, body);
  }

  updateChild(childId: any, body: any) {
    return this.http.put(`${this.baseUrl}/child/${childId}/update/`, body);
  }
  // user Api
  getUsers(searchQuery: string = '', branchIds: any[] = []): Observable<any> {
    let params = new HttpParams();

    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    if (!branchIds || branchIds.length === 0) {
      // 👉 No branches selected, treat it as "all"
      params = params.set('branch_id', 'all');
    } else {
      // 👇 Append each branch_id individually
      branchIds.forEach((id) => {
        params = params.append('branch_id', id.toString());
      });
    }

    return this.http.get(`${this.baseUrl}/user/all/`, { params });
  }
  getUserById(userId: any) {
    return this.http.get(`${this.baseUrl}/user/${userId}/`);
  }

  // Expense
  getExpenses(type: any, paramsOj: any) {
    let params = new HttpParams();

    if (paramsOj.searchQuery) {
      params = params.set('search', paramsOj.searchQuery);
    }
    if (!paramsOj.branchIds || paramsOj.branchIds.length === 0) {
      params = params.set('branch_id', 'all');
    } else {
      paramsOj.branchIds.forEach((id: any) => {
        params = params.append('branch_id', id.toString());
      });
    }
    if (paramsOj.startDate && paramsOj.endDate) {
      params = params.set('start_date', paramsOj.startDate);
      params = params.set('end_date', paramsOj.endDate);
    }
    return this.http.get(`${this.baseUrl}/${type}/all/`, { params });
  }

  getMaterialExpenseById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/material_expense/${id}/`);
  }

  getGeneralExpenseById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/general_expense/${id}/`);
  }

  createGeneralExpense(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/general_expense/create/`, data);
  }

  createMaterialExpense(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/material_expense/create/`, data);
  }

  updateGeneralExpense(id: number, body: any) {
    return this.http.put(`${this.baseUrl}/general_expense/${id}/update/`, body);
  }

  updateMaterialExpense(id: number, body: any) {
    return this.http.put(
      `${this.baseUrl}/material_expense/${id}/update/`,
      body
    );
  }

  // bills Api
  getChildrenBills(type: any, paramsOj: any) {
    let params = new HttpParams();

    if (paramsOj.searchQuery) {
      params = params.set('search', paramsOj.searchQuery);
    }
    if (!paramsOj.branchIds || paramsOj.branchIds.length === 0) {
      params = params.set('branch_id', 'all');
    } else {
      paramsOj.branchIds.forEach((id: any) => {
        params = params.append('branch_id', id.toString());
      });
    }
    if (paramsOj.startDate && paramsOj.endDate) {
      params = params.set('start_date', paramsOj.startDate);
      params = params.set('end_date', paramsOj.endDate);
    }
    return this.http.get(`${this.baseUrl}/bill${type}all/`, { params });
  }
  getChildBillById(billId: any) {
    return this.http.get(`${this.baseUrl}/bill/${billId}/`);
  }
  closeBill(id: any, body: any) {
    return this.http.patch(`${this.baseUrl}/bill/${id}/close/`, body);
  }
}
