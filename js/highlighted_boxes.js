(function() {
    const ctx = canvas_anim_exported.context;
    const cvs = canvas_anim_exported.canvas;
    const ca = canvas_anim_exported;
    const primitives = canvas_anim_exported.Primitive;

    class Path {
        constructor(p1, p2) {
            this.points = [];
            this.distances_sq = [];
            this.total_distance_sq = 0;

            this.reset(p1, p2);
        }

        reset([x0, y0], [x1, y1]) {
            let dx = x0 - x1;
            let dy = y0 - y1;
            let d = Math.sqrt(dx*dx + dy*dy);

            this.points = [[x0, y0], [x1, y1]];
            this.distances_sq = [d, d];
            this.total_distance_sq = d*2;
        }

        add_point([x, y]) {
            let [after_x, after_y] = this.points[0];
            let dx_after = after_x - x;
            let dy_after = after_y - y;
            let dist_after = Math.sqrt(dx_after*dx_after + dy_after*dy_after);

            let [before_x, before_y] = this.points[this.points.length - 1];
            let dx_before = before_x - x;
            let dy_before = before_y - y;
            let dist_before = Math.sqrt( dx_before*dx_before + dy_before*dy_before );

            this.points.push([x, y]);

            this.total_distance_sq += dist_after + dist_before - this.distances_sq[this.distances_sq.length - 1];

            this.distances_sq[this.distances_sq.length - 1] = dist_before;
            this.distances_sq.push(dist_after);
        }

        get_point(alpha) {
            let target_dist = this.total_distance_sq * (alpha%1);
            for(let i = 0; i < this.distances_sq.length; ++i) {
                let dist = this.distances_sq[i];
                if (target_dist < dist) {
                    let t = target_dist / dist;
                    let [bx, by] = this.points[i];
                    let [ax, ay] = this.points[(i+1)%this.points.length];
                    return [
                        (ax - bx) * t + bx,
                        (ay - by) * t + by
                    ];
                }
                target_dist -= dist;
            }
        }

        draw(cvs, ctx) {
            ctx.strokeStyle = ctx.fillStyle = '#00ff00';
            let prev = this.points[this.points.length-1];
            for(let p of this.points) {
                ctx.beginPath();
                ctx.arc(p[0], p[1], 5, 0, 2*Math.PI);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(p[0], p[1]);
                ctx.lineTo(prev[0], prev[1]);
                ctx.stroke();
                prev = p;
            }
        }
    }

    class ParticleFollowPath {
        constructor(path, vel, radius, color, filled = true, weight = 1) {
            this.circle = new primitives.Circle(0, 0, radius, color, filled, weight);
            this.path = path;
            this.pos = 0;
            this.velocity = vel;
        }

        draw(cvs, ctx) {
            let [x, y] = this.path.get_point(this.pos);
            this.circle.x = x;
            this.circle.y = y;
            this.circle.draw(cvs, ctx);
        }

        update(dt) {
            this.pos += this.velocity * dt;
        }
    }

    function create_path_around(box, diff = 20) {
        let bounds = box.getBoundingClientRect();

        let left = bounds.x - diff;
        let top = bounds.y - diff;
        let right = bounds.x + bounds.width + diff;
        let bottom = bounds.y + bounds.height + diff;

        let path = new Path([left, top], [right, top]);
        path.add_point([right, bottom]);
        path.add_point([left, bottom]);
        return path;
    }

    let target_box = null;
    let particles = [];
    let particles_count = 30;

    function set_target_to(box) {
        target_box = box;
        let path = create_path_around(target_box, 10);
        particles = [];
    
        for(let i = 0; i < particles_count; ++i) {
            particles.push(new ParticleFollowPath(path, 0.1, 2, '#ff0000'));
            particles[i].pos = (i / (particles_count - 1));
        }
    }

    function remove_target() {
        target_box = null;
        particles = [];
    }

    window.addEventListener('mousemove', (e) => {
        let elements = document.elementsFromPoint(e.x, e.y);
        for(let elem of elements) {
            if (elem.classList.contains('box')) {
                set_target_to(elem);
                return;
            }
        }
        remove_target();
    })

    ca.set_clear_color('#00000000');

    ca.set_draw_cb(() => {
        for(let p of particles)
            p.draw(cvs, ctx);
    });

    ca.set_update_cb(() => {
        for(let p of particles)
            p.update(ca.dt);
    })
    

})();