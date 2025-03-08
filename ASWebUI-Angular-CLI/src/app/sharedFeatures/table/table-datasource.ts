import { DataSource } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { map } from "rxjs/operators";
import { Observable, of as observableOf, merge, BehaviorSubject } from "rxjs";
import { MatTableDataSource } from "@angular/material/table";


/**
 * Data source for the Testtable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class TableDataSource<T> extends DataSource<T> {
  id:number;
  // public data: any;
  test: MatTableDataSource<T>;
  // paginator: MatPaginator;
  // sort: MatSort;
  paginator: MatPaginator;
  sort: MatSort;
  filterChange$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public DATA$: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);

  // filter: string;
  // columnName: string;
  // filterObject: any;
  constructor(data:T[]) {
    super();
    this.DATA$.next(data);

  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<T[]> {
    
    // return this.DATA$;
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
/*
    let dataMutations = [
      // observableOf(this.data),
      this.DATA$,
      this.filterChange$,
      this.sort?.sortChange,
      this.paginator?.page
    ];

    return merge(...dataMutations);
*/

    console.log("Datasource Paginator", this.paginator);

    let dataMutations;

    if (this.sort && this.paginator) {
      console.log("Sort and Paginator");
      
      dataMutations = [
        this.DATA$,
        this.filterChange$,
        this.sort.sortChange,
        this.paginator.page,
      ];
      
      return merge(...dataMutations).pipe(
        map(() => {
          return this.getSortedData(
            this.getPagedData(this.getFilteredData([...this.DATA$.value]))
          );
        })
      );
    } else if (!this.sort && this.paginator) {
      console.log("Paginator Only");
      dataMutations = [this.DATA$, this.filterChange$, this.paginator.page];
      return merge(...dataMutations).pipe(
        map(() => {
          return this.getPagedData(this.getFilteredData([...this.DATA$.value]));
        })
        );
    } else if (!this.paginator && this.sort) {
        console.log("Sort Only");
        dataMutations = [this.DATA$, this.filterChange$, this.sort.sortChange];
        
        return merge(...dataMutations).pipe(
          map(() => {
            return this.getSortedData(
              this.getFilteredData([...this.DATA$.value])
              );
            })
            );
          } else if (!this.paginator && !this.sort) {
            console.log("NO Sort or Paginator");
            
            dataMutations = [this.DATA$, this.filterChange$];
            
            return merge(...dataMutations).pipe(
              map(() => {
          return this.getFilteredData([...this.DATA$.value]);
        })
      );
    }
    console.log(this.DATA$);
    console.log("END OF CONNECT");
    

    // if(this.paginator){
    //   dataMutations.push(new BehaviorSubject(this.paginator.page));
    // }


    // console.log("dataMutations",dataMutations);


    // return merge(...dataMutations).pipe(
    //   map(() => {

    //       return this.getPagedData(
    //         this.getFilteredData(this.getSortedData([...this.DATA$.value])))
    //   }))

    // console.log("this.paginator",this.paginator);

    // console.log("this.DATA$.value",this.DATA$.value);





    // return merge(...dataMutations).pipe(
    //   map(() => {
    //     return this.getSortedData(this.getPagedData(this.getFilteredData([...this.DATA$.value])))
    //   }))




  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {
    this.DATA$.complete();
   }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: T[]) {
    // if(this.paginator){
      console.log(`this.paginator is ${this.paginator}`);
      console.log(`this.paginator.pageSize is ${this.paginator.pageSize}`);
      console.log(`this.paginator.pageIndex is  ${this.paginator.pageIndex}`);
      console.log(`this.paginator.getNumberOfPages is  ${this.paginator.getNumberOfPages()}`);

    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    if (
      data.length - startIndex < this.paginator.pageSize &&
      data.length > this.paginator.pageSize) {
      let diff = this.paginator.pageSize - (data.length - startIndex);
      // console.log(`diff is ${diff}`);
      // console.log(`startIndex is ${startIndex}`);
      // console.log(`data.length is ${data.length}`);

      for (let i = 0; i < diff; i++) {
        data.push(Object.create(null));
      }
    }

    // console.log(`this.paginator.pageIndex is AFTER ${this.paginator.pageIndex}`);

    // console.log(JSON.stringify(data));
    return data.splice(startIndex, this.paginator.pageSize);

    // }

  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: T[]) {
    // if(this.sort){

    if (!this.sort.active || this.sort.direction === "") {
      return data; //?
    }

    return data.sort((a, b) => {
      let keyName = this.sort.active;
      // console.log(keyName);
      //console.log(a[keyName]);
      return this.compare(
        a[keyName],
        b[keyName],
        this.sort.direction === "asc"
      );
    });

    // }
  }


  filterPredicate(data, filter): boolean {
    return true;
  }

  getFilteredData(data: T[]) {
    //console.log(this.filter);
    //console.log(this.columnName);
    //console.log(data);
    //console.log(this.filterChange$.value);
    console.log("filter");
    

    if (!this.filterChange$.value || this.filterChange$.value === "") {
      if (this.paginator) {
        this.paginator.length = data.length;
      }
      return data;
    }

    let filterObject = JSON.parse(this.filterChange$.value);

    // console.log(filterObject);
    // console.log(Object.keys(filterObject));

    //console.log(data);

    let res = data.filter((data) => {
      return Object.keys(filterObject).some((prop) => {
        //if(data[prop] != null){
        //console.log(prop);
        //console.log(filterObject[prop]);
        //console.log(data[prop]);

        let result =
          data[prop] &&
          data[prop]
            .toString()
            .toLowerCase()
            .indexOf(filterObject[prop].toString().toLowerCase()) !== -1 &&
          filterObject[prop];
        //console.log(result);

        return result;
        //}
      });
    });
    //console.log(res);
    this.paginator.length = res.length;

    // res
    return res;
    //console.log(data[key] === this.filter);

    ///stachoverflow Solution
    // return data.filter((o) =>
    //   Object.keys(filterObject).every((k) =>
    //     [].concat(filterObject[k]).some((v) => o[k].includes(v))
    //   )
    // );
  }

  setData(data: T[]): void {
    
    this.DATA$.next(data);
  }

  addElementToDataStream(element){
    console.log([...this.DATA$.value, element]);
    
    this.DATA$.next([...this.DATA$.value, element])
    // this.DATA$.next(null);
  }

  /** Simple sort comparator (for client-side sorting). */
  compare(a: string | number, b: string | number, isAsc: boolean) {
    return (
      (isAsc ? 1 : -1) * (a < b ? -1 : 1) -
      (a === null ? -1 : 1) +
      (b === null ? -1 : 1) -
      (a === "" ? -1 : 1) +
      (b === "" ? -1 : 1)
    );
  }



}
