(function() {
    const ctx = canvas_anim_exported.context;
    const cvs = canvas_anim_exported.canvas;
    const ca = canvas_anim_exported;
    const primitives = canvas_anim_exported.Primitive;
    ctx.fillStyle = '#232323';
    ctx.fillRect(0, 0, ca.width, ca.height);
    ca.set_clear_color('#23232377');
    ca.use_clear_rect(false);

    let objects = [];

    let radius_spawn = 200;
    let radius = 2;
    let dispersal = 300;
    let range = 100;
    let range_explosion = 1800;
    let force = 800;
    let explosion_force = 200;

    let colors = [
        '#EBF4F7',
        '#E00B27',
        '#2474A6',
        '#F2A30F'
    ];

    function change_color_alpha(color, alpha) {
        return color.substr(0, 7) + Math.floor(alpha*255).toString(16)
    }

    let min_x = ca.width * -1.5;
    let max_x = ca.width * 2;
    let min_y = ca.height * -1.5;
    let max_y = ca.height * 2;

    let min_vel = 10;
    let max_vel = 150;

    for(let i = 0; i < 300; ++i) {
        let rad = Math.random() * 2 * Math.PI;
        objects.push(new primitives.Circle(
            Math.cos(rad) * Math.random() * ca.width + ca.width / 2, 
            Math.sin(rad) * Math.random() * ca.height + ca.height / 2, 
            radius,
            colors[Math.floor(Math.random() * colors.length)]
        ));
    }

    canvas_anim_exported.set_update_cb(() => {
        for(let o of objects) {
            if (ca.mouse.is_defined()) {
                let dx = ca.mouse.x - o.x;
                let dy = ca.mouse.y - o.y;
                o.ax = o.vx * -0.5 + dx * 2 + Math.random() * dispersal - dispersal / 2;
                o.ay = o.vy * -0.5 + dy * 2 + Math.random() * dispersal - dispersal / 2;
                let size = Math.sqrt(o.ax * o.ax + o.ay * o.ay);
                if (size != 0) {
                    o.ax /= size;
                    o.ay /= size;
                }

                let d = Math.sqrt(dx * dx + dy * dy) / range;
                if(d < 1) d = 1;
                let norm = 1 / d;

                o.ax *= norm * force;
                o.ay *= norm * force;
            }
            o.update(ca.dt);

            if (o.x > max_x) o.x = max_x;
            if (o.x < min_x) o.x = min_x;
            if (o.y > max_y) o.y = max_y;
            if (o.y < min_y) o.y = min_y;
        }
    });

    canvas_anim_exported.set_draw_cb(() => {
        for(let o of objects) {
            let vel = Math.sqrt(o.vx * o.vx + o.vy * o.vy);
            if (vel > max_vel) vel = max_vel;
            if (vel < min_vel) vel = min_vel;
            let alpha = (vel - min_vel) / (max_vel - min_vel);
            o.color = change_color_alpha(o.color, alpha);
            o.draw(cvs, ctx);/*
            ctx.beginPath();
            ctx.strokeStyle = '#00ff00';
            ctx.moveTo(o.x, o.y);
            ctx.lineTo(o.x + o.ax, o.y + o.ay);
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = '#0000ff';
            ctx.moveTo(o.x, o.y);
            ctx.lineTo(o.x + o.vx, o.y + o.vy);
            ctx.stroke();*/
        }
    });

    ca.set_button_down_cb((b) => {
        if (b == ca.MOUSE_BUT_LEFT) {
            for(let o of objects) {
                if (ca.mouse.is_defined()) {
                    let dx = ca.mouse.x - o.x;
                    let dy = ca.mouse.y - o.y;
                    let d = Math.sqrt(dx * dx + dy * dy) / range_explosion;
                    let norm = 1 / d;

                    let dir = Math.random() * 2 * Math.PI;
                    o.ax = Math.cos(dir) * norm * explosion_force;
                    o.ay = Math.sin(dir) * norm * explosion_force;
    
                    o.update(ca.dt);
                }
            }
        }
    });

})();