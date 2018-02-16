(function() {
    const ctx = canvas_anim_exported.context;
    const cvs = canvas_anim_exported.canvas;
    const ca = canvas_anim_exported;
    const primitives = canvas_anim_exported.Primitive;

    let objects = [];
    let objects_count = 1000; 
    let mouse_distance = 150;
    let mouse_distance_squared = mouse_distance * mouse_distance;
    let min_radius = 10;
    let max_radius = 40;
    let radius_anim_speed = 50;
    canvas_anim_exported.set_clear_color('#2D373D');
    let colors = [
        //'#324D5C',
        '#46B29D',
        '#F0CA4D',
        '#E37B40',
        '#F53855'
    ];

    function create_circle(radius, colors, velocity_range, filled = true, weigth = 1) {
        let c = new primitives.Circle(
            Math.floor(Math.random() * ca.width),
            Math.floor(Math.random() * ca.height),
            radius,
            colors[Math.floor(Math.random() * colors.length)],
            filled, 
            weigth
        );
        c.vx = Math.random() * velocity_range - velocity_range / 2;
        c.vy = Math.random() * velocity_range - velocity_range / 2;
        return c;
    }

    for(let i = 0; i < objects_count; i++)
        objects.push(create_circle(min_radius, colors, 50, true, 5));

    canvas_anim_exported.set_update_cb(() => {
        for(let o of objects) {
            if (ca.mouse.is_defined()) {
                const diff_x = o.x - ca.mouse.x;
                const diff_y = o.y - ca.mouse.y;
                const dist_squared = (diff_x * diff_x) + (diff_y * diff_y);
                if (dist_squared <= mouse_distance_squared) {
                    o.radius += ca.dt * radius_anim_speed;
                    if (o.radius > max_radius)
                        o.radius = max_radius;
                } else {
                    o.radius -= ca.dt * radius_anim_speed;
                    if (o.radius < min_radius)
                        o.radius = min_radius;
                }
            }
            o.update(ca.dt);
            o.keep_in_bounds(ca.screen_bounds());
        }
    });

    canvas_anim_exported.set_draw_cb(() => {
        for(let o of objects) {
            o.draw(cvs, ctx);
        }
    });

    ca.set_resize_cb((old_w, old_h, w, h) => {
        for(let o of objects) {
            o.x = o.x / old_w * w;
            o.y = o.y / old_h * h;
        }
    });

})();