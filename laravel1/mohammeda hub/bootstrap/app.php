<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\CheckAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Monolog\Handler\HandlerInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register your middleware aliases here
        $middleware->alias([
            'check.admin' => \App\Http\Middleware\CheckAdmin::class,
            // Add any other custom middleware aliases you need
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
