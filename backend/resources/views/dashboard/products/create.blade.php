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

        <h1 class="text-2xl font-bold mb-6 text-gray-800">Create a New Product</h1>

        {{-- Alert Error --}}
        @if ($errors->any())
            <div
                class="py-[18px] px-6 font-normal font-Inter text-sm rounded-md bg-warning-500 bg-opacity-[14%] text-warning-500 mb-6">
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

        <form action="{{ route('product.store') }}" method="POST" enctype="multipart/form-data" class="space-y-5">
            @csrf

            {{-- Name --}}
            <div class="input-area">
                <label for="name" class="form-label">Title</label>
                <div>
                    <input id="name" name="name" type="text" value="{{ old('name') }}"
                        class="form-control pr-9" placeholder="Product Name">
                </div>
            </div>

            {{-- Slug --}}
            <div class="input-area">
                <label for="slug" class="form-label">Slug</label>
                <div>
                    <input id="slug" readonly="readonly" name="slug" type="text" value="{{ old('slug') }}"
                        class="form-control pr-9" placeholder="Slug">
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

            {{-- Description --}}
            <div class="input-area">
                <label for="description" class="form-label">Description</label>
                <div>
                    <textarea id="description" name="description" rows="4" class="form-control pr-9" placeholder="Description">{{ old('description') }}</textarea>
                </div>
            </div>

            {{-- Category --}}
            <div class="input-area">
                <label for="select2basic" class="form-label">Category</label>
                <select name="category" id="select2basic" class="select2 form-control w-full mt-2 py-2">
                    <option value="" disabled selected hidden>Pilih kategori...</option>
                    @foreach ($categories as $category)
                        <option value="{{ $category->id }}" class=" inline-block font-Inter font-normal text-sm text-slate-600">{{ $category->name }}</option>
                    @endforeach
                </select>
            </div>

            {{-- Price --}}
            <div class="input-area">
                <label for="price" class="form-label">Price</label>
                <div>
                    <input id="price" name="price" type="number" step="0.01" value="{{ old('price') }}"
                        class="form-control pr-9" placeholder="0.00">
                </div>
            </div>

            {{-- Discount --}}
            <div class="input-area">
                <label for="discount" class="form-label">Discount (%)</label>
                <div>
                    <input id="discount" name="discount" type="number" step="0.01" value="{{ old('discount') }}"
                        class="form-control pr-9" placeholder="0">
                </div>
            </div>

            {{-- Stock --}}
            <div class="input-area">
                <label for="stock" class="form-label">Stock</label>
                <div>
                    <input id="stock" name="stock" type="number" value="{{ old('stock') }}"
                        class="form-control pr-9" placeholder="0">
                </div>
            </div>

            {{-- Variants Section --}}
            <div class="input-area">
                <div class="flex justify-between items-center mb-3">
                    <label class="form-label mb-0">Variants</label>
                    <button type="button" id="add-variant" class="btn inline-flex justify-center btn-outline-primary rounded-md text-sm">
                        <iconify-icon icon="heroicons-outline:plus" class="text-xl ltr:mr-1 rtl:ml-1"></iconify-icon>
                        Add Variant
                    </button>
                </div>
                
                <div id="variants-container" class="space-y-3">
                    <!-- Variants will be added here dynamically -->
                </div>
            </div>

            <div class="pt-4">
                <button type="submit" class="btn inline-flex justify-center btn-primary rounded-md" id="btn-submit"
                    onclick="loading">Submit</button>
                <button class="btn inline-flex justify-center btn-primary " id="btn-loading" style="display: none;"
                    disabled>
                    <iconify-icon class="text-xl spin-slow ltr:mr-2 rtl:ml-2 relative top-[1px]"
                        icon="line-md:loading-twotone-loop"></iconify-icon>
                    <span>Loading</span>
                </button>
            </div>
        </form>
    </div>

    <script>
        document.getElementById('name').addEventListener('input', function() {
            const name = this.value;
            const slug = name.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            document.getElementById('slug').value = slug;
        });

        const $buttonSubmit = document.getElementById('btn-submit');
        const $buttonLoading = document.getElementById('btn-loading');

        function loading() {
            $buttonSubmit.style.display = 'none';
            $buttonLoading.style.display = 'inline-flex';
        }

        // Variants functionality
        let variantCount = 0;
        const variantsContainer = document.getElementById('variants-container');
        const addVariantButton = document.getElementById('add-variant');

        // Function to add a new variant
        function addVariant() {
            variantCount++;
            
            const variantDiv = document.createElement('div');
            variantDiv.className = 'variant-item p-4 border border-slate-200 rounded-md bg-slate-50';
            variantDiv.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-medium text-slate-700 text-lg">Variant #${variantCount}</h4>
                    <button type="button" class="remove-variant text-danger-500 hover:text-danger-600">
                        <iconify-icon icon="heroicons-outline:trash" class="text-lg"></iconify-icon>
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="form-label text-sm">Variant Name</label>
                        <input type="text" name="variants[${variantCount}][name]" 
                               class="form-control" placeholder="e.g., Size, Color, etc." required>
                    </div>
                    <div>
                        <label class="form-label text-sm">Additional Price</label>
                        <input type="number" step="0.01" name="variants[${variantCount}][additional_price]" 
                               class="form-control" placeholder="0.00" value="0">
                    </div>
                </div>
            `;
            
            variantsContainer.appendChild(variantDiv);
            
            // Add event listener to remove button
            const removeButton = variantDiv.querySelector('.remove-variant');
            removeButton.addEventListener('click', function() {
                variantDiv.remove();
                updateVariantNumbers();
            });
        }

        // Function to update variant numbers after removal
        function updateVariantNumbers() {
            const variantItems = variantsContainer.querySelectorAll('.variant-item');
            variantCount = 0;
            
            variantItems.forEach((item, index) => {
                variantCount++;
                const title = item.querySelector('h4');
                title.textContent = `Variant #${variantCount}`;
                
                // Update input names
                const nameInput = item.querySelector('input[name^="variants"]');
                const priceInput = item.querySelector('input[name$="additional_price"]');
                
                nameInput.name = `variants[${variantCount}][name]`;
                priceInput.name = `variants[${variantCount}][additional_price]`;
            });
        }

        // Add initial variant if needed
        // addVariant(); // Uncomment if you want one variant by default

        // Event listener for add variant button
        addVariantButton.addEventListener('click', addVariant);
    </script>
@endsection