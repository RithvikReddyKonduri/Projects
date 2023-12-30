let resources = new Promise((resolve)=>{
    PIXI.Loader.shared
    .add('bullet', 'images/MuzzleFlash.png')
    .add('gIdle', 'images/Gunner_Blue_Idle.png')
    .add('gJump', 'images/Gunner_Blue_Jump.png')
    .add('gRun', 'images/Gunner_Blue_Run.png')
    .add('gDeath', 'images/Gunner_Blue_Death.png')
    .add('gCrouch', 'images/Gunner_Blue_Crouch.png')
    .add('eWalk', 'images/enemy walk.png')
    .add('eHurt', 'images/enemy hurt.png')
    .add('eDeath', 'images/enemy dead.png')
    .add('eAttack2', 'images/enemy attact 2.png')
    .add('erIdle', 'images/enemy robot1 idle.png')
    .add('erWalk', 'images/enemy robot 1 walk.png')
    .add('erDeath', 'images/enemy robot 1 death.png')
    .add('erShot', 'images/enemy robot 1 shot.png').load((_, resources)=>{
        resolve(resources)
    })
})

function getRecoruces(){
    return resources
}