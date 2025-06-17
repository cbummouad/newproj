<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\FormData;

class FormDataController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'location' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:255',
        ]);

        $formData = new FormData();
        if ($request->hasFile('image')) {
            $imageName = time() . '.' . $request->image->extension();
            $request->image->move(public_path('images'), $imageName);
            $formData->image = 'images/' . $imageName;
        }
        $formData->location = $request->location;
        $formData->title = $request->title;
        $formData->type = $request->type;
        $formData->save();

        return redirect()->route('dashboard')->with('flash', ['message' => 'Form data saved successfully!']); // Return Inertia response with flash message
    }
}
