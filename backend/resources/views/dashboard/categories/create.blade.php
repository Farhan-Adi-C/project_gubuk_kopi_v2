@extends('layouts.app')

@section('title', 'Create Product Page')

@section('content')

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
    <div class="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
        
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Create a New Category</h1>

        {{-- Alert Error --}}
        @if ($errors->any())
            <div class="py-[18px] px-6 font-normal font-Inter text-sm rounded-md bg-warning-500 bg-opacity-[14%] text-warning-500 mb-6">
                <div class="flex items-start space-x-3 rtl:space-x-reverse">
                    <div class="flex-1">
                        <strong class="block mb-1">Oops! Ada kesalahan pada input:</strong>
                        <ul class="list-disc list-inside space-y-1">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        @endif

        <form action="{{ route('category.store') }}" method="POST" enctype="multipart/form-data" class="space-y-5">
            @csrf

            {{-- Name --}}
            <div class="input-area">
                <label for="name" class="form-label">Name</label>
                <div>
                    <input id="name" name="name" type="text" value="{{ old('name') }}"
                        class="form-control pr-9" placeholder="Category Name">
                </div>
            </div>

         

            {{-- Image --}}
            <div class="multiFilePreview">
                <label class="form-label">Image</label>
                <label>
                    <input type="file" class=" w-full hidden" name="image" accept=".jpg, .jpeg, .png">
                    <span class="w-full h-[40px] file-control flex items-center custom-class">
                        <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                            <span id="placeholder" class="text-slate-400">Choose a file or drop it here...</span>
                        </span>
                        <span
                            class="file-name flex-none cursor-pointer border-l px-4 border-slate-200 dark:border-slate-700 h-full inline-flex items-center bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm rounded-tr rounded-br font-normal">Browse</span>
                    </span>
                </label>
                <div id="file-preview"></div>
            </div>

          
            <div class="pt-4">
                <button type="submit" class="btn inline-flex justify-center btn-primary rounded-md" id="btn-submit" onclick="loading">Submit</button>
                <button class="btn inline-flex justify-center btn-primary " id="btn-loading" style="display: none;" disabled>
                    <iconify-icon class="text-xl spin-slow ltr:mr-2 rtl:ml-2 relative top-[1px]"
                        icon="line-md:loading-twotone-loop"></iconify-icon>
                    <span>Loading</span>
                </button>
            </div>
        </form>
    </div>

    <script>


        const $buttonSubmit = document.getElementById('btn-submit');
        const $buttonLoading = document.getElementById('btn-loading');
        function loading() {
            $buttonSubmit.style.display = 'none';
            $buttonLoading.style.display = 'inline-flex';
        }
    </script>
@endsection
