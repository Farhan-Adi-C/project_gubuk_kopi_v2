@extends('layouts.app')
@section('title', 'Product Page')
@section('content')
     <div class="transition-all duration-150 container-fluid" id="page_layout">
         <div id="content_layout">




             <!-- BEGIN: Breadcrumb -->
             <div class="mb-5">
                 <ul class="m-0 p-0 list-none">
                     <li class="inline-block relative top-[3px] text-base text-primary-500 font-Inter ">
                         <a href="index.html">
                             <iconify-icon icon="heroicons-outline:home"></iconify-icon>
                             <iconify-icon icon="heroicons-outline:chevron-right"
                                 class="relative text-slate-500 text-sm rtl:rotate-180"></iconify-icon>
                         </a>
                     </li>
                     <li class="inline-block relative text-sm text-primary-500 font-Inter ">
                         Table
                         <iconify-icon icon="heroicons-outline:chevron-right"
                             class="relative top-[3px] text-slate-500 rtl:rotate-180"></iconify-icon>
                     </li>
                     <li class="inline-block relative text-sm text-slate-500 font-Inter dark:text-white">
                         Basic-Table</li>
                 </ul>
             </div>
             <!-- END: BreadCrumb -->


             <div class=" space-y-5">
                 <div class="card">
                     <header class=" card-header noborder">
                         <h4 class="card-title">List Categories
                         </h4>
                         <a href="{{ route('category.create') }}"
                             class="btn inline-flex justify-center btn-primary rounded-md">
                             <span class="flex items-center">
                                 <iconify-icon class="text-xl ltr:mr-2 rtl:ml-2"
                                     icon="heroicons-outline:plus-circle"></iconify-icon>
                                 <span>Add Category</span>
                             </span>
                         </a>
                     </header>
                     <div class="card-body px-6 pb-6">
                         <div class="overflow-x-auto -mx-6 dashcode-data-table">
                             <span class=" col-span-8  hidden"></span>
                             <span class="  col-span-4 hidden"></span>
                             <div class="inline-block min-w-full align-middle">
                                 <div class="overflow-hidden ">
                                     <table
                                         class="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700 data-table">
                                         <thead class=" bg-slate-200 dark:bg-slate-700">
                                             <tr>

                                                 <th scope="col" class=" table-th ">
                                                     Id
                                                 </th>

                                                 <th scope="col" class=" table-th ">
                                                     Image
                                                 </th>

                                                 <th scope="col" class=" table-th ">
                                                     Name
                                                 </th>

                                                 <th scope="col" class=" table-th ">
                                                     Action
                                                 </th>

                                             </tr>
                                         </thead>
                                         <tbody
                                             class="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                                             @foreach ($categories as $category)
                                                 <tr>
                                                     <td class="table-td">{{ $loop->iteration }}</td>
                                                     <td class="table-td">
                                                         <span class="flex">
                                                             <span
                                                                 class="w-14 h-14 rounded-full ltr:mr-3 rtl:ml-3 flex-none">
                                                                 <img src="{{ asset('storage/' . $category->image) }}"
                                                                     alt="1"
                                                                     class="object-cover w-full h-full rounded-md">
                                                             </span>
                                                         </span>
                                                     </td>
                                                     <td class="table-td ">{{ $category->name }}</td>
                                                   
                                                     <td class="table-td ">
                                                         <div class="flex space-x-3 rtl:space-x-reverse">
                                                             <a href="" class="action-btn">
                                                                 <iconify-icon icon="heroicons:eye"></iconify-icon>
                                                             </a>
                                                             <a href="{{ route('category.edit', $category->id) }}"
                                                                 class="action-btn">
                                                                 <iconify-icon
                                                                     icon="heroicons:pencil-square"></iconify-icon>
                                                             </a>
                                                             <form action="{{ route('category.destroy', $category->id) }}"
                                                                 method="POST"
                                                                 onsubmit="return confirm('Are you sure you want to delete this Product?');">
                                                                 @csrf
                                                                 @method('DELETE')
                                                                 <button class="action-btn" type="submit">
                                                                     <iconify-icon icon="heroicons:trash"></iconify-icon>
                                                                 </button>
                                                             </form>
                                                         </div>
                                                     </td>
                                                 </tr>
                                             @endforeach
                                         </tbody>
                                     </table>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>

         </div>
     </div>

@endsection