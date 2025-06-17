<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->guard()->check() || auth()->guard()->user()->role !== 'admin') {
            return redirect('/'); // Redirect non-admin users to the home page
        }

        return $next($request);
    }
}
