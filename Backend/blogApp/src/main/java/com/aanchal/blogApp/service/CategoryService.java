package com.aanchal.blogApp.service;

import com.aanchal.blogApp.entity.Category;

import java.util.List;

public interface CategoryService {
    Category createCategory(String name, String description);
    List<Category> getAllCategories();
    Category getCategoryById(Long id);
    void deleteCategory(Long id);
}