(function() {
    const ctx = canvas_anim_exported.context;
    const cvs = canvas_anim_exported.canvas;
    const ca = canvas_anim_exported;
    const primitives = canvas_anim_exported.Primitive;
    ca.set_clear_color('#232334');

    class Comet {
        constructor(x, y, diffuse_count) {
            this.ball = new primitives.Circle(x, y, 5, '#ffffffff');
            this.oldy = y;
            this.dy = 0;
            this.ball.vx = 900;
            this.ball.vy = -150;
            this.ball.set_force('gravity', [0, 150]);
        }

        draw(cvs, ctx) {
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(this.ball.x, this.ball.y - 5);
            ctx.lineTo(this.ball.x - 50, this.ball.y + this.dy);
            ctx.lineTo(this.ball.x, this.ball.y + 5);
            ctx.fill();
            this.ball.draw(cvs, ctx);

            ctx.shadowBlur = 0;
        }

        update(dt) {
            this.oldy = this.ball.y;
            this.ball.update(dt);
            this.dy = this.oldy - this.ball.y;
        }
    }

    class Star extends primitives.Circle {
        constructor(x, y, radius, color, color_2) {
            super(x, y, radius, color);
            this.color_2 = color_2;
        }
        draw(cvs, ctx) {
            ctx.shadowColor = this.color_2;
            ctx.shadowBlur = 5;
            ctx.fillStyle = this.color_2;
            let d = this.radius * 5;
            let p = this.radius;
            ctx.beginPath();
            ctx.moveTo(this.x - d, this.y    );
            ctx.lineTo(this.x - p, this.y + p);
            ctx.lineTo(this.x    , this.y + d);
            ctx.lineTo(this.x + p, this.y + p);
            ctx.lineTo(this.x + d, this.y    );
            ctx.lineTo(this.x + p, this.y - p);
            ctx.lineTo(this.x    , this.y - d);
            ctx.lineTo(this.x - p, this.y - p);
            ctx.lineTo(this.x - d, this.y    );
            ctx.fill();
            super.draw(cvs, ctx);
            ctx.shadowBlur = 0;
        }
    }

    let objects = [];

    function create_comet() {
        return new Comet(Math.random() * ca.width - 10, (Math.random() + 0.20) * (ca.height / 10 * 8), 5);
    }

    function create_star() {
        let star = new Star(Math.random() * ca.width, Math.random() * ca.height, Math.random() * 2.5, '#FFC31E88', '#FFC31E66');
        return star;
    }

    for(let i = 0; i < 20; i++) 
        objects.push(create_comet());

    for(let i = 0; i < 30; i++) 
        objects.push(create_star());

    canvas_anim_exported.set_update_cb(() => {
        for(let o of objects) {
            o.update(ca.dt);
            if (o instanceof Comet && o.ball.x > ca.width + 50) {
                o.ball.x %= ca.width;
                o.ball.x -= 50;
                o.oldy = o.ball.y = (Math.random() + 0.20) * (ca.height / 10 * 8);
                o.dy = 0;
                o.ball.vy = -150;
            }
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